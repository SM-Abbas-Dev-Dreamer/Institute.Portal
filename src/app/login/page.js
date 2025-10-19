"use client";
import React, { useState } from "react";
import "./login.css";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Step 1: Sign in user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 🔹 Step 2: Get user's role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        if (userData.role === role) {
          // 🔹 Step 3: Redirect based on role
          // if (role === "admin") router.push("/admin");
          // else if (role === "teacher") router.push("/teacher");
          router.push("/");
        } else {
          setError("❌ Role mismatch! Please select your correct role.");
        }
      } else {
        setError("User record not found in Firestore.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-body">
      <div className="login-sheet"></div>
      <div className="login">
        <h1>Log In</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="fa fa-user"></i>
            <label>Email</label>
          </div>

          <div className="input-box">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="fa fa-lock"></i>
            <label>Password</label>
          </div>

          <Select value={role} onValueChange={(value) => setRole(value)}>
            <SelectTrigger className="role-select-trigger w-[300px] ">
              <SelectValue placeholder="Select Role w-[200px]   " />
            </SelectTrigger>

            <SelectContent className="role-select-content">
              <SelectGroup>
                <SelectLabel className="role-select-label">Roles</SelectLabel>
                <SelectItem value="student" className="role-select-item">
                  Student
                </SelectItem>
                <SelectItem value="teacher" className="role-select-item">
                  Teacher
                </SelectItem>
                <SelectItem value="admin" className="role-select-item">
                  Admin
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="login-bottom">
            <div className="forget-password">
              <Link href="/reset">Forget Password?</Link>
            </div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
