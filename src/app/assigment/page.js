"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../../../firebaseconfig";
import "./student-assign.css";

// 🔹 Import API functions
import { fetchStudentClass, fetchAssignmentsByClass } from "../../lib/assigment/assigementApi";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [studentClass, setStudentClass] = useState("");
  const [user, setUser] = useState(null);

  // 🔹 Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const className = await fetchStudentClass(currentUser.email);
          setStudentClass(className);
        } catch (error) {
          console.error("Error fetching student class:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Fetch assignments when class is known
  useEffect(() => {
    const loadAssignments = async () => {
      if (!studentClass) return;
      try {
        const data = await fetchAssignmentsByClass(studentClass);
        setAssignments(data);
      } catch (error) {
        console.error("Error loading assignments:", error);
      }
    };
    loadAssignments();
  }, [studentClass]);

  // 🔹 Countdown Timer
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
