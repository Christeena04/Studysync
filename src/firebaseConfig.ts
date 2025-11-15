// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";


// 🔥 Replace these with your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyAEUUG_sZdzD2i_AptIpUs9S-vRr3GQ0WA",
  authDomain: "studysync-9f257.firebaseapp.com",
  projectId: "studysync-9f257",
  databaseURL: "https://studysync-9f257-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "studysync-9f257.firebasestorage.app",
  messagingSenderId: "324809422879",
  appId: "1:324809422879:web:c1209a48a10e4c79323d2a",
  measurementId: "G-YTBKDMEMGE"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
