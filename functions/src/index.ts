import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();
const WEBSITE_ORIGIN = 'https://schoolpulse.victorbee.com';

function cors(req: any, res: any) {
  const origin = req.get('origin');
  if (origin === WEBSITE_ORIGIN || origin === 'http://localhost:4321') {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,X-Firebase-AppCheck');
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
