"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./profile.css";

const StudentProfile = () => {
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

  // 🔹 Resize image before upload
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
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.7 // compression quality
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

  // 🔹 Upload image to Cloudinary
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
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const imageUrl = data.secure_url;

      // 🔹 Update Firestore user profile
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: imageUrl });

      setPreview(imageUrl);
      setUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="user-personal-info">
        <div className="user-img">
          <label htmlFor="imageUpload">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-camera"></i>
              </div>
            )}
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          {uploading && <p>Uploading...</p>}
        </div>

        {userData && (
          <div className="about">
            <h4>About</h4>
            <p className="info-box">
              <span>
                <i className="fa-solid fa-user"></i> Name:
              </span>{" "}
              {userData.name}
            </p>
            <p className="info-box">
              <span>
                <i className="fa-solid fa-phone"></i> Phone:
              </span>{" "}
              {userData.phone}
            </p>
            <p className="info-box email">
              <span>
                <i className="fa-solid fa-envelope"></i> Email:
              </span>{" "}
              {userData.email}
            </p>
            <p className="info-box">
              <span>
                <i className="fa-solid fa-id-card"></i> CNIC:
              </span>{" "}
              {userData.cnic}
            </p>
            <p className="info-box">
              <span>
                <i className="fa-solid fa-location-dot"></i> Address:
              </span>{" "}
              {userData.address}
            </p>
            <p className="info-box">
              <span>
                <i className="fa-solid fa-graduation-cap"></i> Class:
              </span>{" "}
              {userData.className}
            </p>
            <p className="info-box">
              <span>
                <i class="fa-solid fa-circle-user"></i> Status:
              </span>{" "}
              {userData.role}
            </p>
          </div>
        )}
      </div>
      <div className="institute-info">
        <h4>Recent Information</h4>
        <div className="student-table">
          <table >
            <tr>
              <th>Overall Attandance</th>
              <td>Semester 1</td>
              <td>Semester 2</td>
              <td>Semester 3</td>
              <td>Semester 5</td>
              <td>Semester 6</td>
              <td>Semester 7</td>
              <td>Semester 8</td>
            </tr>
            <tr>
              <th> Overall result</th>
             <td>Semester 1</td>
              <td>Semester 2</td>
              <td>Semester 3</td>
              <td>Semester 5</td>
              <td>Semester 6</td>
              <td>Semester 7</td>
              <td>Semester 8</td>
            </tr>
            <tr>
              <th>Presentation</th>
              <td>Semester 1</td>
              <td>Semester 2</td>
              <td>Semester 3</td>
              <td>Semester 5</td>
              <td>Semester 6</td>
              <td>Semester 7</td>
              <td>Semester 8</td>
            </tr>
            <tr>
              <th>Sports Activity</th>
              <td>Semester 1</td>
              <td>Semester 2</td>
              <td>Semester 3</td>
              <td>Semester 5</td>
              <td>Semester 6</td>
              <td>Semester 7</td>
              <td>Semester 8</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
