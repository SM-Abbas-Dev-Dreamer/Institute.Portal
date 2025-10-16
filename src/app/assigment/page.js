"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./student-assign.css";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [studentClass, setStudentClass] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // 🔹 Get student class from "users" collection
        const q = query(collection(db, "users"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setStudentClass(data.className);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Fetch assignments for the student's class
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!studentClass) return;
      const q = query(collection(db, "assignments"), where("className", "==", studentClass));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(data);
    };

    fetchAssignments();
  }, [studentClass]);

  // 🔹 Countdown Timer Function
  const calculateTimeLeft = (lastDate) => {
    const difference = new Date(lastDate).getTime() - new Date().getTime();
    if (difference <= 0) return "Expired";

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="student-assignment-container">
      <h2>📘 Your Assignments</h2>
      {assignments.length === 0 ? (
        <p>No assignments found for your class ({studentClass || "Unknown"}).</p>
      ) : (
        <div className="assignment-list">
          {assignments.map((assign) => (
            <div key={assign.id} className="assignment-card">
              <h3>{assign.title}</h3>
              <p><strong>Description:</strong> {assign.description}</p>
              <p><strong>Rules:</strong> {assign.rules}</p>
              <p><strong>Total Marks:</strong> {assign.totalMarks}</p>
              <p><strong>Last Date:</strong> {assign.lastDate}</p>
              <p className="countdown">
                ⏳ Time Left: {calculateTimeLeft(assign.lastDate)}
              </p>
              <p className="posted-by">
                <strong>Posted by:</strong> {assign.teacherName} ({assign.teacherEmail})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
