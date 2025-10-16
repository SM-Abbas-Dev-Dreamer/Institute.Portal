"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./AdminTimetable.css";

export default function AdminTimetablePage() {
  const [day, setDay] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [editId, setEditId] = useState(null);

  // check logged in admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user)
        setAdmin({ name: user.displayName || "Admin", email: user.email });
      else setAdmin(null);
    });
    return () => unsub();
  }, []);

  // fetch teachers
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeachers(data);
    });
    return () => unsubscribe();
  }, []);

  // fetch classes from "classes" collection
  useEffect(() => {
    const q = query(collection(db, "classes"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClasses(data);
    });
    return () => unsubscribe();
  }, []);

  // fetch timetables
  useEffect(() => {
    const q = query(collection(db, "timetables"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTimetables(data);
    });
    return () => unsubscribe();
  }, []);

  const isValidForm = () => {
    if (!day || !subject || !startTime || !endTime || !teacherEmail) {
      alert("Sab fields fill karein (Room optional).");
      return false;
    }
    if (startTime >= endTime) {
      alert("Start time chhota hona chahiye end time se.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setDay("");
    setSubject("");
    setRoom("");
    setStartTime("");
    setEndTime("");
    setTeacherEmail("");
    setEditId(null);
  };

  // create new timetable entry
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isValidForm()) return;

    try {
      // add timetable
      await addDoc(collection(db, "timetables"), {
        day,
        subject,
        room,
        startTime,
        endTime,
        teacherEmail,
        teacherName: teachers.find((t) => t.email === teacherEmail)?.name || "",
        createdBy: admin?.email || null,
        createdAt: new Date().toISOString(),
      });

      // update teacher's classes array
      const teacherDoc = teachers.find((t) => t.email === teacherEmail);
      if (teacherDoc) {
        const teacherRef = doc(db, "users", teacherDoc.id);
        await updateDoc(teacherRef, {
          classes: arrayUnion(subject),
        });
      }

      resetForm();
    } catch (err) {
      console.error("create timetable error:", err);
      alert("Failed to create timetable entry.");
    }
  };

  // prepare edit
  const startEdit = (entry) => {
    setEditId(entry.id);
    setDay(entry.day || "");
    setSubject(entry.subject || "");
    setRoom(entry.room || "");
    setStartTime(entry.startTime || "");
    setEndTime(entry.endTime || "");
    setTeacherEmail(entry.teacherEmail || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // update entry
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isValidForm() || !editId) return;

    try {
      const ref = doc(db, "timetables", editId);
      await updateDoc(ref, {
        day,
        subject,
        room,
        startTime,
        endTime,
        teacherEmail,
        teacherName: teachers.find((t) => t.email === teacherEmail)?.name || "",
        updatedBy: admin?.email || null,
        updatedAt: new Date().toISOString(),
      });

      // update teacher's classes array
      const teacherDoc = teachers.find((t) => t.email === teacherEmail);
      if (teacherDoc) {
        const teacherRef = doc(db, "users", teacherDoc.id);
        await updateDoc(teacherRef, {
          classes: arrayUnion(subject),
        });
      }

      resetForm();
    } catch (err) {
      console.error("update error:", err);
      alert("Failed to update entry.");
    }
  };

  // delete entry
  const handleDelete = async (id) => {
    if (!confirm("Kya aap sach mein is entry ko delete karna chahte hain?"))
      return;
    try {
      await deleteDoc(doc(db, "timetables", id));
      // note: teacher's array remove not included (optional)
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="admin-timetable-page">
      <div className="form-card">
        <h1> Admin — Set Class Timetable</h1>
        <form onSubmit={editId ? handleUpdate : handleCreate} className="tform">
          <div className="row">
            <label>Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
            >
              <option value="">Select Day</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>

          <div className="row">
            <label>Class / Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name || c.className}>
                  {c.name || c.className}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label>Room (optional)</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room / Lab"
            />
          </div>

          <div className="times-row">
            <div>
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row">
            <label>Assign Teacher</label>
            <select
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.email}>
                  {t.name || t.email}
                </option>
              ))}
            </select>
          </div>

          <div className="actions">
            <button type="submit" className="primary">
              {editId ? "Update Entry" : "Create Entry"}
            </button>
            {/* <button type="button" className="muted" onClick={resetForm}>
              Reset
            </button> */}
          </div>
        </form>
      </div>

      <div className="list-card">
        <h2> Current Timetable Entries</h2>
        {timetables.length === 0 ? (
          <p>No timetable entries yet.</p>
        ) : (
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Class</th>
                <th>Room</th>
                <th>Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.day}</td>
                  <td>
                    {entry.startTime} - {entry.endTime}
                  </td>
                  <td>{entry.subject}</td>
                  <td>{entry.room || "—"}</td>
                  <td>{entry.teacherName || entry.teacherEmail}</td>
                  <td className="">
                    <div className="table-btn">
                      <button
                        className="small"
                        onClick={() => startEdit(entry)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="small danger"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
