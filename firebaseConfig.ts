// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHLpUYR2_6LGgncYwtPg_GuMyOXwIVyP0",
  authDomain: "psu-marketplace-667d4.firebaseapp.com",
  projectId: "psu-marketplace-667d4",
  storageBucket: "psu-marketplace-667d4.firebasestorage.app",
  messagingSenderId: "972392064531",
  appId: "1:972392064531:web:8b6b0874297b0e134f81e6",
  measurementId: "G-2FXCFX95BM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);