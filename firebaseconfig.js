import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJ5y47qQDFMBgPpCnXa4TBSXw7LVQ5Y3g",
  authDomain: "portal-d7ddd.firebaseapp.com",
  projectId: "portal-d7ddd",
  storageBucket: "portal-d7ddd.firebasestorage.app",
  messagingSenderId: "404602455007",
  appId: "1:404602455007:web:34f172cda7ed1e76d0ba6a",
  measurementId: "G-0YN42W38SJ",
};

// 🔹 Initialize main Firebase app (for admin login, reading/writing data)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Initialize a SECONDARY Firebase app (for creating new users only)
let secondaryApp;
if (getApps().length < 2) {
  secondaryApp = initializeApp(firebaseConfig, "Secondary");
} else {
  secondaryApp = getApps().find((app) => app.name === "Secondary");
}

const secondaryAuth = getAuth(secondaryApp);

// 🔹 Export all
export { app, auth, db, secondaryAuth };
export default app;
