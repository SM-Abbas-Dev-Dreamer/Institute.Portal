import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDJ5y47qQDFMBgPpCnXa4TBSXw7LVQ5Y3g",
  authDomain: "portal-d7ddd.firebaseapp.com",
  projectId: "portal-d7ddd",
  storageBucket: "portal-d7ddd.firebasestorage.app",
  messagingSenderId: "404602455007",
  appId: "1:404602455007:web:34f172cda7ed1e76d0ba6a",
  measurementId: "G-0YN42W38SJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const signout = getAuth(app);
export const db = getFirestore(app);
export default app;