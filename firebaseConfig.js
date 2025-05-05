import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDunhStoSMKyWWX9Neipuh9gdWB17QUBa4",
  authDomain: "group-proyecto.firebaseapp.com",
  databaseURL: "https://group-proyecto-default-rtdb.firebaseio.com",
  projectId: "group-proyecto",
  storageBucket: "group-proyecto.firebasestorage.app",
  messagingSenderId: "1092434680388",
  appId: "1:1092434680388:web:2b0dbad3dc9cfaced93a11",
  measurementId: "G-8EL1JJ791M"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
