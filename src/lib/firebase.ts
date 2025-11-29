import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCpe1uMMyvuiduErpuj5B4UGRYJo0pKMSE",
    authDomain: "analytics-pro-top1.firebaseapp.com",
    projectId: "analytics-pro-top1",
    storageBucket: "analytics-pro-top1.firebasestorage.app",
    messagingSenderId: "633071191476",
    appId: "1:633071191476:web:0ed06e68124d0c50599ee1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
