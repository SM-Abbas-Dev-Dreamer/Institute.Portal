"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./profile.css";

const AdminProfile = () => {
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = "dmndspodq";
  const UPLOAD_PRESET = "portal";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          if (userSnap.data().photoURL) setPreview(userSnap.data().photoURL);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const width = 100;
          const height = 100;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const resizedBlob = await resizeImage(file);
      const formData = new FormData();
      formData.append("file", resizedBlob);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      const imageUrl = data.secure_url;

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: imageUrl });

      setPreview(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="user-personal-info">
        <h4>Personal Info</h4>
        {userData && (
          <div className="about">
            <div className="grid-box">
              <div className="user-img">
                <label htmlFor="imageUpload">
                  {preview ? (
                    <img src={preview} alt="Profile" />
                  ) : (
                    <div>
                      <i className="fa-solid fa-camera"></i>
                    </div>
                  )}
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {uploading && <p>Uploading...</p>}
              </div>
            </div>
            <div className=" grid-box">
              <p className="info-box">
                <span>👤 Full Name:</span> {userData.name}
              </p>
              <p className="info-box">
                <span>🧾 Admin ID:</span> {userData.adminId}
              </p>
              <p className="info-box">
                <span>📧 Email:</span> {userData.email}
              </p>
              <p className="info-box">
                <span>📱 Phone:</span> {userData.phone}
              </p>
            </div>

            <div className=" grid-box">
              <h4>System Management Info</h4>
              <p className="info-box">
                <span>🧑‍🎓 Total Students:</span> {userData.totalStudents}
              </p>
              <p className="info-box">
                <span>👩‍🏫 Total Teachers:</span> {userData.totalTeachers}
              </p>
              <p className="info-box">
                <span>🏫 Departments Count:</span> {userData.departments}
              </p>
              <p className="info-box">
                <span>💰 Fees Collected:</span> {userData.feesCollected}
              </p>
              <p className="info-box">
                <span>📦 Pending Applications:</span> {userData.pendingApps}
              </p>
            </div>

            <div className=" grid-box">
              <h4>Portal Info</h4>
              <p className="info-box">
                <span>⚙️ Manage Roles:</span> Yes
              </p>
              <p className="info-box">
                <span>📊 Analytics Dashboard:</span> Active
              </p>
              <p className="info-box">
                <span>🔔 Recent Notifications:</span> {userData.notifications}
              </p>
            </div>

            <div className=" grid-box">
              <h4>Actions</h4>
              <ul>
                <li>✏️ Edit Admin Info</li>
                <li>🧑‍💻 Add / Remove Users</li>
                <li>🧾 Generate Reports</li>
                <li>🔒 Change Password</li>
              </ul>
            </div>
            <div className="grid-box">
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
