import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyCvVUyX1_3tuxHlhS3rdCruV08_FISvIG8',
  appId: '1:925585407650:web:73c0b063dc0398cf9461fb',
  messagingSenderId: '925585407650',
  projectId: 'school-pulse-3d95b',
  authDomain: 'school-pulse-3d95b.firebaseapp.com',
  storageBucket: 'school-pulse-3d95b.firebasestorage.app',
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
auth.useDeviceLanguage();

export const functionsBaseUrl = 'https://europe-west1-school-pulse-3d95b.cloudfunctions.net';
// Reliable Flutter web fallback. After app.schoolpulse.victorbee.com is
// attached to this Firebase Hosting site, this can be switched to the custom
// subdomain without changing the registration or approval workflow.
export const appUrl = 'https://school-pulse-3d95b.web.app';
