import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfigJSON from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJSON.apiKey,
  authDomain: firebaseConfigJSON.authDomain,
  projectId: firebaseConfigJSON.projectId,
  storageBucket: firebaseConfigJSON.storageBucket,
  messagingSenderId: firebaseConfigJSON.messagingSenderId,
  appId: firebaseConfigJSON.appId,
  measurementId: firebaseConfigJSON.measurementId
};

const app = initializeApp(firebaseConfig);

// Using initializeFirestore with long polling to bypass potential websocket issues in the iframe
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfigJSON.firestoreDatabaseId);

export const auth = getAuth(app);

// Test Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('permission-denied'))) {
      console.error("Firestore connection status:", error.message);
    }
  }
}
testConnection();
