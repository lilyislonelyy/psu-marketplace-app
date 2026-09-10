// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👉 กรอกค่าจาก Firebase console ของคุณ
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

// ✅ export auth + db
export const auth = getAuth(app);
export const db = getFirestore(app);
