import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();
const WEBSITE_ORIGIN = 'https://schoolpulse.victorbee.com';
const APP_URL = 'https://app.schoolpulse.victorbee.com';
const ALLOWED_PLANS = ['Starter', 'Growth', 'Pro', 'Enterprise'];

function cors(req: any, res: any) {
  const origin = req.get('origin');
  if (origin === WEBSITE_ORIGIN || origin === 'http://localhost:4321') {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Firebase-AppCheck');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return true; }
  return false;
}

function normalizePhone(value: unknown): string | null {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (/^07\d{8}$/.test(digits)) return `256${digits.slice(1)}`;
  if (/^2567\d{8}$/.test(digits)) return digits;
  return null;
}

function text(value: unknown, max = 200): string {
  return String(value ?? '').trim().slice(0, max);
}

async function rateLimit(req: any, bucket: string, limit = 8) {
  const ip = text(req.ip || req.get('x-forwarded-for') || 'unknown', 80);
  const hour = new Date().toISOString().slice(0, 13);
  const ref = db.collection('_public_rate_limits').doc(`${bucket}_${Buffer.from(ip).toString('hex').slice(0, 80)}_${hour}`);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const count = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
    if (count >= limit) return false;
    tx.set(ref, { count: count + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return true;
  });
}

async function verifiedIdentity(req: any) {
  const header = text(req.get('authorization'), 5000);
  if (!header.startsWith('Bearer ')) return null;
  try {
    const decoded = await getAuth().verifyIdToken(header.slice(7));
    if (!decoded.uid || !decoded.email || !decoded.email_verified) return null;
    return decoded;
  } catch {
    return null;
  }
}

export const submitDemoRequest = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!(await rateLimit(req, 'demo'))) { res.status(429).json({ error: 'too_many_requests' }); return; }
  const phone = normalizePhone(req.body?.phone);
  const schoolName = text(req.body?.schoolName, 160);
  const contactName = text(req.body?.contactName, 120);
  if (!phone || !schoolName || !contactName) { res.status(400).json({ error: 'invalid_request' }); return; }
  const id = randomUUID();
  await db.collection('public_demo_leads').doc(id).set({
    id, schoolName, contactName, phone,
    email: text(req.body?.email, 160), district: text(req.body?.district, 100),
    studentCountRange: text(req.body?.studentCountRange, 40), preferredContact: text(req.body?.preferredContact, 30),
    message: text(req.body?.message, 1500), status: 'new', source: 'public_website', createdAt: FieldValue.serverTimestamp(),
  });
  res.status(201).json({ ok: true, id });
});

export const submitContactRequest = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!(await rateLimit(req, 'contact'))) { res.status(429).json({ error: 'too_many_requests' }); return; }
  const phone = normalizePhone(req.body?.phone);
  const name = text(req.body?.name, 120);
  const message = text(req.body?.message, 1500);
  if (!phone || !name || !message) { res.status(400).json({ error: 'invalid_request' }); return; }
  const id = randomUUID();
  await db.collection('public_contact_requests').doc(id).set({ id, name, phone, email: text(req.body?.email, 160), message, status: 'new', source: 'public_website', createdAt: FieldValue.serverTimestamp() });
  res.status(201).json({ ok: true, id });
});

export const submitSchoolApplication = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!(await rateLimit(req, 'school_application', 5))) { res.status(429).json({ error: 'too_many_requests' }); return; }
  const identity = await verifiedIdentity(req);
  if (!identity) { res.status(401).json({ error: 'verified_auth_required', message: 'A verified School Pulse account is required.' }); return; }

  const school = req.body?.school ?? {};
  const location = req.body?.location ?? {};
  const administrator = req.body?.administrator ?? {};
  const plan = text(req.body?.plan, 40);
  const schoolName = text(school.name, 160);
  const schoolEmail = text(school.email, 160).toLowerCase();
  const schoolPhone = normalizePhone(school.phone);
  const prefix = text(school.prefix, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const adminEmail = text(administrator.email, 160).toLowerCase();
  const adminPhone = normalizePhone(administrator.phone);

  if (!schoolName || !schoolEmail || !schoolPhone || !prefix || !text(school.category, 80) || !text(location.region, 40) || !text(location.district, 100) || !text(location.address, 240) || !text(administrator.firstName, 100) || !text(administrator.lastName, 100) || !adminPhone || adminEmail !== String(identity.email).toLowerCase() || !ALLOWED_PLANS.includes(plan) || req.body?.termsAccepted !== true) {
    res.status(400).json({ error: 'invalid_application', message: 'Required registration information is missing or invalid.' }); return;
  }

  const ref = db.collection('public_school_applications').doc(identity.uid);
  const existing = await ref.get();
  if (existing.exists && ['approved', 'pending_review'].includes(String(existing.data()?.status ?? ''))) {
    res.status(409).json({ error: 'application_exists', message: 'A school application already exists for this account.' }); return;
  }

  const prefixMatch = await db.collection('public_school_applications').where('school.prefix', '==', prefix).limit(1).get();
  if (!prefixMatch.empty && prefixMatch.docs[0].id !== identity.uid) {
    res.status(409).json({ error: 'prefix_in_use', message: 'That school prefix is already in use. Choose another.' }); return;
  }

  await ref.set({
    id: identity.uid,
    authUid: identity.uid,
    status: 'pending_review',
    source: 'public_website',
    plan,
    school: {
      name: schoolName,
      shortName: text(school.shortName, 40),
      email: schoolEmail,
      phone: schoolPhone,
      category: text(school.category, 80),
      poBox: text(school.poBox, 80),
      prefix,
      motto: text(school.motto, 180),
    },
    location: {
      region: text(location.region, 40),
      district: text(location.district, 100),
      address: text(location.address, 240),
      website: text(location.website, 240),
      locationName: text(location.locationName, 140),
      latitude: text(location.latitude, 40),
      longitude: text(location.longitude, 40),
    },
    administrator: {
      firstName: text(administrator.firstName, 100),
      lastName: text(administrator.lastName, 100),
      gender: text(administrator.gender, 40),
      phone: adminPhone,
      email: adminEmail,
      username: text(administrator.username, 120),
      emailVerified: true,
    },
    marketingOptIn: req.body?.marketingOptIn === true,
    termsAccepted: true,
    termsAcceptedAt: FieldValue.serverTimestamp(),
    createdAt: existing.exists ? existing.data()?.createdAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  }, { merge: true });

  res.status(201).json({ ok: true, applicationId: identity.uid, status: 'pending_review', schoolName });
});

export const getSchoolApplicationStatus = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (!['GET', 'POST'].includes(req.method)) { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const identity = await verifiedIdentity(req);
  if (!identity) { res.status(401).json({ error: 'verified_auth_required' }); return; }
  const ref = db.collection('public_school_applications').doc(identity.uid);
  const snap = await ref.get();
  if (!snap.exists) { res.status(404).json({ error: 'application_not_found' }); return; }
  const data = snap.data()!;
  await ref.set({ lastStatusCheckAt: FieldValue.serverTimestamp() }, { merge: true });
  res.status(200).json({
    status: text(data.status, 40),
    schoolName: text(data.school?.name, 160),
    plan: text(data.plan, 40),
    appReady: false,
    appUrl: APP_URL,
  });
});

export const createSubscriptionCheckout = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!(await rateLimit(req, 'checkout', 5))) { res.status(429).json({ error: 'too_many_requests' }); return; }
  const phone = normalizePhone(req.body?.phone);
  const schoolName = text(req.body?.schoolName, 160);
  const contactName = text(req.body?.contactName, 120);
  const plan = text(req.body?.plan, 40);
  if (!phone || !schoolName || !contactName || !['Starter','Growth','Pro'].includes(plan)) { res.status(400).json({ error: 'invalid_request' }); return; }
  const id = randomUUID();
  await db.collection('public_subscription_checkouts').doc(id).set({
    id, schoolName, contactName, phone, plan,
    email: text(req.body?.email, 160), district: text(req.body?.district, 100), studentCount: Number(req.body?.studentCount ?? 0),
    billingCycle: text(req.body?.billingCycle, 20), paymentMethod: text(req.body?.paymentMethod, 40),
    status: 'created', paymentProvider: 'yo_payments', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  res.status(201).json({ ok: true, checkoutId: id, status: 'created' });
});

export const initiateYoPayment = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const checkoutId = text(req.body?.checkoutId, 80);
  if (!checkoutId) { res.status(400).json({ error: 'invalid_request' }); return; }
  const snap = await db.collection('public_subscription_checkouts').doc(checkoutId).get();
  if (!snap.exists) { res.status(404).json({ error: 'checkout_not_found' }); return; }
  res.status(503).json({ error: 'payment_provider_not_configured', provider: 'yo_payments', message: 'Yo! Payments production API credentials and verified callback handling are required before payment initiation is enabled.' });
});

export const getCheckoutStatus = onRequest({ region: 'europe-west1' }, async (req, res) => {
  if (cors(req, res)) return;
  const checkoutId = text(req.query.checkoutId, 80);
  if (!checkoutId) { res.status(400).json({ error: 'invalid_request' }); return; }
  const snap = await db.collection('public_subscription_checkouts').doc(checkoutId).get();
  if (!snap.exists) { res.status(404).json({ error: 'checkout_not_found' }); return; }
  const data = snap.data()!;
  res.status(200).json({ checkoutId, status: data.status, plan: data.plan, schoolName: data.schoolName, paymentProvider: data.paymentProvider });
});
