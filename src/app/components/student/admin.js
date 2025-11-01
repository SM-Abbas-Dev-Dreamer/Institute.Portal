"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
        console.error("Error fetching admin data:", error);
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
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {userData ? (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-3 gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center text-center border-r md:border-r-gray-200">
            <label htmlFor="imageUpload" className="cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border shadow"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="fa-solid fa-camera text-gray-600 text-3xl"></i>
                </div>
              )}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {uploading && (
              <p className="text-blue-500 text-sm mt-2 animate-pulse">
                Uploading...
              </p>
            )}
            <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
            <p className="text-gray-600">{userData.email}</p>
            <p className="text-gray-500 mt-1">🧾 Admin ID: {userData.adminId}</p>
          </div>

          {/* Admin Info */}
          <div className="col-span-2 grid gap-6">
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏫 Institute Overview
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Total Departments:</strong>{" "}
                  {userData.departments || 0}
                </p>
                <p>
                  <strong>Total Teachers:</strong>{" "}
                  {userData.totalTeachers || 0}
                </p>
                <p>
                  <strong>Total Students:</strong>{" "}
                  {userData.totalStudents || 0}
                </p>
                <p>
                  <strong>Fees Collected:</strong> Rs.{" "}
                  {userData.feesCollected || "0"}
                </p>
              </div>
            </section>

            {/* System Info */}
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ⚙️ System Management
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Portal Status:</strong>{" "}
                  <span className="text-green-600 font-medium">Active</span>
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {userData.lastUpdated || "Recently"}
                </p>
                <p>
                  <strong>Pending Requests:</strong>{" "}
                  {userData.pendingApps || 0}
                </p>
                <p>
                  <strong>Notifications:</strong> {userData.notifications || 0}
                </p>
              </div>
            </section>

            {/* Actions */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🔐 Admin Controls
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Manage Teachers & Students</li>
                <li>Generate Financial Reports</li>
                <li>Approve or Reject Applications</li>
                <li>Update Portal Policies</li>
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading admin data...</p>
      )}
    </div>
  );
};

export default AdminProfile;
