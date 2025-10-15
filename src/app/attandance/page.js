"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseconfig";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import "./attend.css"; // agar CSS external file me hai

function AttendancePage() {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTeacher(user);
        fetchAssignedClasses(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAssignedClasses = async (teacherId) => {
    const q = query(collection(db, "timetable"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAssignedClasses(data);
  };

  const fetchStudents = async (className) => {
    const q = query(collection(db, "students"), where("className", "==", className));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(data);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return alert("Select a class first!");

    await addDoc(collection(db, "attendance"), {
      className: selectedClass,
      teacherName: teacher.displayName || "Unknown",
      teacherEmail: teacher.email,
      date: new Date().toLocaleString(),
      records: attendance,
    });

    alert("Attendance Submitted Successfully!");
  };

  return (
    <div className="attendance-container">
      <h2>Mark Attendance</h2>

      <div className="select-class">
        <label>Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            fetchStudents(e.target.value);
          }}
        >
          <option value="">-- Select --</option>
          {assignedClasses.map((cls) => (
            <option key={cls.id} value={cls.className}>
              {cls.className} ({cls.subject})
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
                <td>{s.rollNo}</td>
                <td>
                  <select
                    onChange={(e) =>
                      handleAttendanceChange(s.id, e.target.value)
                    }
                  >
                    <option value="">--Select--</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
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
    </div>
  );
}

export default AttendancePage;
