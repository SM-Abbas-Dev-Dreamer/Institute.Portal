"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseconfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
} from "firebase/firestore";
import "./attend.css";

export default function AttendancePage() {
  const [teacher, setTeacher] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);

  // 🔹 Get logged-in teacher and assigned classes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setTeacher(user);

        // fetch teacher document
        const qTeacher = query(collection(db, "users"), where("email", "==", user.email));
        const teacherSnap = await getDocs(qTeacher);
        if (!teacherSnap.empty) {
          const teacherData = teacherSnap.docs[0].data();
          setAssignedClasses(teacherData.classes || []);
        }

        // fetch recent attendance for this teacher
        fetchRecentAttendance(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStudents = async (className) => {
    setSelectedClass(className);
    setStudents([]);
    if (!className) return;

    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("className", "==", className)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setStudents(data);

    // reset attendance
    const initialAttendance = {};
    data.forEach((s) => (initialAttendance[s.id] = ""));
    setAttendance(initialAttendance);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return alert("Select a class first!");
    if (!teacher) return alert("Teacher not detected!");

    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    await addDoc(collection(db, "attendance"), {
      className: selectedClass,
      teacherName: teacher.displayName || "Unknown",
      teacherEmail: teacher.email,
      date: today,
      records: attendance,
    });

    alert("Attendance Submitted Successfully!");
    setStudents([]);
    setSelectedClass("");
    setAttendance({});
    fetchRecentAttendance(teacher.email);
  };

  const fetchRecentAttendance = async (teacherEmail) => {
    const q = query(
      collection(db, "attendance"),
      where("teacherEmail", "==", teacherEmail),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setRecentAttendance(data);
  };

  return (
    <div className="attendance-container">
      <h2>Mark Attendance</h2>

      <div className="select-class">
        <label>Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => fetchStudents(e.target.value)}
        >
          <option value="">-- Select --</option>
          {assignedClasses.map((cls, idx) => (
            <option key={idx} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {students.length > 0 && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td>
                  <select
                    value={attendance[s.id]}
                    onChange={(e) => handleAttendanceChange(s.id, e.target.value)}
                  >
                    <option value="">--</option>
                    <option value="P">P</option>
                    <option value="A">A</option>
                    <option value="L">L</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {students.length > 0 && (
        <button onClick={handleSubmit} className="submit-btn">
          Submit Attendance
        </button>
      )}

      {recentAttendance.length > 0 && (
        <div className="recent-attendance">
          <h3>Recent Attendance</h3>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.date}</td>
                  <td>{rec.className}</td>
                  <td>
                    {Object.entries(rec.records).map(([studentId, status]) => (
                      <span key={studentId}>
                        {students.find((s) => s.id === studentId)?.name || studentId}: {status}{" "}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
