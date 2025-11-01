"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import Loading3 from "../components/loading/loading3";
import Image from "next/image";
import Navgation from "../components/skelatan/navigation"

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem("userUID");
        const role = localStorage.getItem("userRole");

        if (!uid || !role) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          setError("User not found in database");
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading3 />
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-10 text-red-600 text-lg font-semibold">
        {error}
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[400px]">
        <div className="flex flex-col items-center">
          {user?.imageURL ? (
            <Image
              src={user.imageURL}
              alt="User"
              width={100}
              height={100}
              className="rounded-full mb-4 object-cover"
            />
          ) : (
            <div className="w-[100px] h-[100px] bg-gray-300 rounded-full mb-4 flex items-center justify-center text-gray-700">
              No Image
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">
            {user?.name || "No Name"}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
          <p className="mt-2 text-blue-600 font-medium capitalize">
            Role: {user?.role}
          </p>

          <div className="mt-5 w-full border-t border-gray-200 pt-4">
            <p className="text-gray-700">
              <strong>UID:</strong> {localStorage.getItem("userUID")}
            </p>
            {user?.className && (
              <p className="text-gray-700">
                <strong>Class:</strong> {user.className}
              </p>
            )}
            {user?.courses && Array.isArray(user.courses) && (
              <p className="text-gray-700">
                <strong>Courses:</strong> {user.courses.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
            <Navgation/>
    </div>
  );
};

export default UserProfile;
