"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { auth, db } from "../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { submitApplication, fetchUserApplications } from "../../lib/application/applicationApi";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import "./application.css";

const ApplicationPage = () => {
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [applicationText, setApplicationText] = useState("");

  const { handleSubmit, reset } = useForm();

  // 🔹 Load current user and their applications
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const user = userSnap.data();
          setUserData(user);
          const apps = await fetchUserApplications(currentUser.uid);
          setApplications(apps);
        } else {
          console.log("❌ No user document found for UID:", currentUser.uid);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Submit Form
  const onSubmit = async () => {
    if (!applicationText.trim()) {
      setMessage("❌ Please write your application before sending.");
      return;
    }

    if (!userData) {
      setMessage("⚠️ Please wait, your profile is still loading...");
      return;
    }

    try {
      await submitApplication(userData, applicationText);
      setMessage("✅ Application sent successfully!");
      setApplicationText("");
      reset();
      const apps = await fetchUserApplications(auth.currentUser.uid);
      setApplications(apps);
    } catch (error) {
      console.error("Error sending application:", error);
      setMessage("❌ Failed to send application.");
    }
  };

  // 🔹 React Quill settings
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className="application-page">
      <div className="application-card">
        <h2 className="page-title">Submit Your Application</h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
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
      </div>

      {/* 🔹 Recent Applications */}
      <div className="recent-applications">
        <h3>Your Recent Applications</h3>
        {applications.length === 0 ? (
          <p className="no-data">No applications sent yet.</p>
        ) : (
          <table className="applications-table">
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
                    className={`status ${
                      app.status === "Pending"
                        ? "pending"
                        : app.status === "Approved"
                        ? "approved"
                        : "rejected"
                    }`}
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
