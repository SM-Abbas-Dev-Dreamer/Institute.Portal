"use client";
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebaseconfig.js";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import StudentProfile from "../components/student/student.js";
import TeacherProfile from "../components/student/teacher.js";
import AdminProfile from "../components/student/admin.js";

// 🔹 Import role-based components

const ProfilePage = () => {
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setRole(userData.role);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setRole("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* 🔹 Role-based Component Rendering */}
      {role === "admin" && (
        <>
        <AdminProfile />
        </>
      )}
      {role === "teacher" && (
          <>
          <TeacherProfile/>
        </>
      )}
      {role === "student" && (
          <>
          <StudentProfile/>
        </>
      )}

      {!role && <p>Loading...</p>}

      <button
        onClick={handleSignOut}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
