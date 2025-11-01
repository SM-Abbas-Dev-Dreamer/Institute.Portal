// src/api/assignmentApi.js
import { db } from "../../../firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";

// 🔹 Fetch student's class name
export const fetchStudentClass = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().className || null;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching student class:", error);
    throw error;
  }
};

// 🔹 Fetch assignments for a specific class
export const fetchAssignmentsByClass = async (className) => {
  try {
    const q = query(collection(db, "assignments"), where("className", "==", className));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    throw error;
  }
};
