import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

// 🔹 Submit application
export const submitApplication = async (userData, applicationText) => {
  if (!userData || !applicationText.trim()) {
    throw new Error("Missing required data");
  }

  await addDoc(collection(db, "applications"), {
    uid: auth.currentUser.uid,
    name: userData.name || "Unknown",
    email: userData.email || "Unknown",
    rollNumber: userData.rollNumber || "N/A",
    role: userData.role || "Student",
    applicationText,
    date: new Date().toLocaleString(),
    status: "Pending",
    createdAt: serverTimestamp(),
  });
};

// 🔹 Fetch user’s previous applications
export const fetchUserApplications = async (uid) => {
  const q = query(
    collection(db, "applications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
