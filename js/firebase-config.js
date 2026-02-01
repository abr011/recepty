// Firebase configuration
// Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDvFrANzvCiY0bwYcmjMOP9QAv8Um99g3w",
  authDomain: "library-5310e.firebaseapp.com",
  projectId: "library-5310e",
  storageBucket: "library-5310e.firebasestorage.app",
  messagingSenderId: "1088476769404",
  appId: "1:1088476769404:web:ae47c30ec02618054aadf9"
};

// Import Firebase SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export for use in other modules
export { db, storage, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, ref, uploadBytes, getDownloadURL };
