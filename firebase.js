// js/firebase.js

// Firebase SDKs import (Authentication & Database ONLY)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
// (यह वही पुराना कोड है जो आपको Firebase Console से मिला था)
const firebaseConfig = {
  apiKey: "AIzaSyBgauWF0y7BrxKQnyPKmPvco--v9Bh3f1E",
  authDomain: "m-tailor-14a6b.firebaseapp.com",
  projectId: "m-tailor-14a6b",
  storageBucket: "m-tailor-14a6b.firebasestorage.app",
  messagingSenderId: "234330649003",
  appId: "1:234330649003:web:fb4c50437325f2d20262ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export services (Note: Storage hataya gaya hai)
export { 
    auth, 
    db, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    getDoc
};

// Cloudinary Configuration (सिर्फ एक जगह सेव रखने के लिए)
export const cloudinaryConfig = {
    cloudName: "dslduznns", // अपना Cloud Name यहाँ डालें
    uploadPreset: "ML-Tailor"       // अपना Preset Name यहाँ डालें
};

console.log("Firebase Connected (Storage handled by Cloudinary)");