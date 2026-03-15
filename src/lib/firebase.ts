import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ REPLACE these with your real Firebase config from Firebase Console
// Go to: Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyBhYzrRLxAqiB0Q7aJzaYd4kMnx7CH6-lw",
  authDomain: "avonpclova.firebaseapp.com",
  projectId: "avonpclova",
  storageBucket: "avonpclova.firebasestorage.app",
  messagingSenderId: "331507830978",
  appId: "1:331507830978:web:9e3ed572e014aed943ab5b",
  measurementId: "G-NXQ8HQJS39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
