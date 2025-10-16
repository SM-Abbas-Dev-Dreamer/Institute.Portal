"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./AssignmentPage.css";

export default function AssignmentPage() {
  const [teacher, setTeacher] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [className, setClassName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // 🔹 Get logged in teacher info
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTeacher({
          name: user.displayName || "Unknown",
          email: user.email,
        });
      }
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch All Classes from Firestore
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        const classesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllClasses(classesData);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // 🔹 Fetch teacher's assignments from Firestore
  useEffect(() => {
    if (!teacher) return;
    const q = query(
      collection(db, "assignments"),
      where("teacherEmail", "==", teacher.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(data);
    });
    return () => unsubscribe();
  }, [teacher]);

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacher) {
      alert("Please login first");
      return;
    }

    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        rules,
        className,
        totalMarks,
        deadline,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        createdAt: new Date().toISOString(),
      });
      alert("✅ Assignment created successfully!");
      setTitle("");
      setDescription("");
      setRules("");
      setClassName("");
      setTotalMarks("");
      setDeadline("");
    } catch (err) {
      console.error("Error adding assignment:", err);
      alert("❌ Failed to save assignment");
    }
  };

  // 🔹 Countdown Timer
  const getCountdown = (deadline) => {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;

    if (diff <= 0) return "Time Over";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [updateTrigger, setUpdateTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setUpdateTrigger((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="assignment-page">
      <div className="assignment-container">
        <h1>📝 Create Assignment</h1>

        <form onSubmit={handleSubmit} className="assignment-form">
          <input
            type="text"
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Assignment Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <textarea
            placeholder="Rules"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            required
          ></textarea>

          <input
            type="number"
            placeholder="Total Marks"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            required
          />

          {/* 🔹 Dropdown for Classes from Firestore */}
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          >
            <option value="">Select Class</option>
            {allClasses.map((cls) => (
              <option key={cls.id} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>

          <div className="date-section">
            <label>Last Date</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <button type="submit">Submit Assignment</button>
        </form>

        {teacher && (
          <p className="logged-info">
            Logged in as: <b>{teacher.name}</b> ({teacher.email})
          </p>
        )}
      </div>

      {/* 🔹 Teacher's Assignments List */}
      <div className="assignment-list">
        <h2>📋 Your Created Assignments</h2>
        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Class</th>
                <th>Total Marks</th>
                <th>Remaining Time</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.className}</td>
                  <td>{a.totalMarks}</td>
                  <td className="countdown">{getCountdown(a.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
