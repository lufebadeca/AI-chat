// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "messenger-eb3a9.firebaseapp.com",
  projectId: "messenger-eb3a9",
  storageBucket: "messenger-eb3a9.firebasestorage.app",
  messagingSenderId: "495103966813",
  appId: "1:495103966813:web:f11a08d1348798d262d7b4",
  measurementId: "G-7K3Z5T3KBM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//export const storage getFirestore(storage);