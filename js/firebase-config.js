// Firebase configuration for recepty project (Realtime Database)
const firebaseConfig = {
  apiKey: "AIzaSyAyS7reIz9a9_WUo-iznMW6nlk2ZhTfqyY",
  authDomain: "recepty-5c6ce.firebaseapp.com",
  databaseURL: "https://recepty-5c6ce-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "recepty-5c6ce",
  storageBucket: "recepty-5c6ce.firebasestorage.app",
  messagingSenderId: "442737443523",
  appId: "1:442737443523:web:02ecb9e68fe5c212e29876"
};

// Import Firebase SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, get, set, push, update, remove, child } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export for use in other modules
export { db, storage, ref, get, set, push, update, remove, child, storageRef, uploadBytes, getDownloadURL };
