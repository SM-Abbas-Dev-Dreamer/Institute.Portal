"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../../firebaseconfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import "./application.css";

const ApplicationPage = () => {
  const [applicationText, setApplicationText] = useState("");
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          fetchUserApplications(currentUser.uid);
        } else {
          console.log("❌ No user document found for UID:", currentUser.uid);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserApplications = async (uid) => {
    try {
      const q = query(
        collection(db, "applications"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!applicationText.trim()) {
      setMessage("❌ Please write your application before sending.");
      return;
    }

    if (!userData) {
      setMessage("⚠️ Please wait, your profile is still loading...");
      return;
    }

    try {
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

      setApplicationText("");
      setMessage("✅ Application sent successfully!");
      fetchUserApplications(auth.currentUser.uid);
    } catch (error) {
      console.error("Error sending application:", error);
      setMessage("❌ Failed to send application.");
    }
  };

  // 🔹 Quill Toolbar Configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div className="application-container">
      <h2>📝 Student Application</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <ReactQuill
          theme="snow"
          value={applicationText}
          onChange={setApplicationText}
          modules={modules}
          formats={formats}
          placeholder="Write your application here..."
          className="rich-editor"
        />
        <button type="submit" className="submit-btn">
          Send Application
        </button>
      </form>

      {/* 🔹 Recent Applications Section */}
      <div className="recent-applications">
        <h3>📄 Your Recent Applications</h3>
        {applications.length === 0 ? (
          <p>No applications sent yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Application Text</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td dangerouslySetInnerHTML={{ __html: app.applicationText }} />
                  <td>{app.date}</td>
                  <td
                    className={
                      app.status === "Pending"
                        ? "status pending"
                        : app.status === "Approved"
                        ? "status approved"
                        : app.status === "Rejected"
                        ? "status rejected"
                        : ""
                    }
                  >
                    {app.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;
