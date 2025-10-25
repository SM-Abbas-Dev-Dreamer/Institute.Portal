"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const TeacherProfile = () => {
  const [teacher, setTeacher] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = "dmndspodq";
  const UPLOAD_PRESET = "portal";

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setTeacher(snap.data());
          if (snap.data().photoURL) setPreview(snap.data().photoURL);
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };
    fetchTeacherData();
  }, []);

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
        };
        img.src = e.target.result;
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

      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, { photoURL: imageUrl });

      setPreview(imageUrl);
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {teacher ? (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-3 gap-6">
          {/* Image */}
          <div className="flex flex-col items-center text-center border-r md:border-r-gray-200">
            <label htmlFor="imageUpload" className="cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border shadow"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-camera text-3xl text-gray-600"></i>
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
              <p className="text-blue-500 mt-2 text-sm animate-pulse">
                Uploading...
              </p>
            )}
            <h2 className="mt-4 text-xl font-semibold">{teacher.name}</h2>
            <p className="text-gray-600">{teacher.email}</p>
            <p className="text-gray-500">📞 {teacher.phone}</p>
          </div>

          {/* Teacher Info */}
          <div className="col-span-2 grid gap-6">
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏫 Teaching Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Teacher ID:</strong> {teacher.teacherId || "N/A"}
                </p>
                <p>
                  <strong>Department:</strong> {teacher.department || "N/A"}
                </p>
                <p>
                  <strong>Subjects:</strong> {teacher.subjects || "N/A"}
                </p>
                <p>
                  <strong>Total Classes:</strong>{" "}
                  {teacher.totalClasses || "0"}
                </p>
              </div>
            </section>

            {/* Academic Performance */}
            <section className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📅 Work Overview
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Attendance:</strong>{" "}
                  {teacher.attendance ? `${teacher.attendance}%` : "N/A"}
                </p>
                <p>
                  <strong>Students Assigned:</strong>{" "}
                  {teacher.studentsAssigned || 0}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {teacher.experience || "0 Years"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      teacher.active ? "text-green-600" : "text-red-600"
                    } font-semibold`}
                  >
                    {teacher.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🧾 Actions
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Upload Assignments</li>
                <li>View Student Reports</li>
                <li>Schedule Classes</li>
                <li>Submit Attendance</li>
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading teacher data...</p>
      )}
    </div>
  );
};

export default TeacherProfile;
