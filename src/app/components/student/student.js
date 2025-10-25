"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const width = 150;
          const height = 150;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {userData ? (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-3 gap-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center text-center border-r md:border-r-gray-200">
            <label htmlFor="imageUpload" className="cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover shadow-md border"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <i className="fa-solid fa-camera text-3xl"></i>
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
              <p className="text-sm text-blue-500 mt-2 animate-pulse">
                Uploading...
              </p>
            )}

            <h2 className="mt-4 text-xl font-semibold">{userData.name}</h2>
            <p className="text-gray-600">{userData.email}</p>
            <p className="text-gray-500 mt-1">📱 {userData.phone}</p>
          </div>

          {/* Student Details */}
          <div className="col-span-2 grid gap-6">
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🎓 Student Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Student ID:</strong> {userData.studentId || "N/A"}
                </p>
                <p>
                  <strong>Department:</strong> {userData.department || "N/A"}
                </p>
                <p>
                  <strong>Semester:</strong> {userData.semester || "N/A"}
                </p>
                <p>
                  <strong>Session:</strong> {userData.session || "N/A"}
                </p>
              </div>
            </section>

            {/* Academic Info */}
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📚 Academic Performance
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>GPA:</strong> {userData.gpa || "Not Available"}
                </p>
                <p>
                  <strong>Total Credits:</strong>{" "}
                  {userData.totalCredits || "0"}
                </p>
                <p>
                  <strong>Completed Courses:</strong>{" "}
                  {userData.completedCourses || "N/A"}
                </p>
                <p>
                  <strong>Attendance:</strong>{" "}
                  {userData.attendance ? `${userData.attendance}%` : "N/A"}
                </p>
              </div>
            </section>

            {/* System Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ⚙️ System Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Role:</strong> {userData.role || "Student"}
                </p>
                <p>
                  <strong>Joined On:</strong>{" "}
                  {userData.joinDate || "Not Available"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      userData.active ? "text-green-600" : "text-red-600"
                    } font-semibold`}
                  >
                    {userData.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading student data...</p>
      )}
    </div>
  );
};

export default StudentProfile;
