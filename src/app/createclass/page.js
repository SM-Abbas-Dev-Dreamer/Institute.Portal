"use client";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import "./CreateClassPage.css";

export default function CreateClassPage() {
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // 🔹 Real-time fetch classes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(data);
    });
    return () => unsub();
  }, []);

  // 🔹 Add / Update class
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return alert("Please enter a class name");

    try {
      if (editMode) {
        // 🔹 Update existing class
        const ref = doc(db, "classes", editId);
        await updateDoc(ref, { className: className.trim() });
        alert("Class updated successfully!");
        setEditMode(false);
        setEditId(null);
      } else {
        // 🔹 Add new class
        await addDoc(collection(db, "classes"), {
          className: className.trim(),
          createdAt: new Date().toISOString(),
        });
        alert("Class created successfully!");
      }

      setClassName("");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  // 🔹 Edit class
  const handleEdit = (cls) => {
    setEditMode(true);
    setEditId(cls.id);
    setClassName(cls.className);
  };

  // 🔹 Delete class
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      await deleteDoc(doc(db, "classes", id));
      alert("Class deleted successfully!");
    }
  };

  return (
    <>
      <h1 className="createclass">
        {" "}
        {editMode ? "Edit Class" : "Create New Class"}
      </h1>
      <div className="create-class-page">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter class name e.g. BSCS-1st Semester"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />

            <button type="submit">
              {editMode ? "Update Class" : "Add Class"}
            </button>
          </form>
        </div>

        {/* 🔹 List of Classes */}
        <div className="class-list">
          <h2> All Created Classes</h2>
          {classes.length === 0 ? (
            <p>No classes created yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.className}</td>
                    <td>
                      <div className="edit-btn">
                        <button
                          onClick={() => handleEdit(cls)}
                        >
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(cls.id)}
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
    </>
  );
}
