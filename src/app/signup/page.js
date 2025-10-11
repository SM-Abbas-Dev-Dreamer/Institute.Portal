"use client";
import React, { useState } from "react";
import "./signup.css";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, db } from "../../../firebaseconfig.js";
import {
  doc,
  getDocs,
  getDoc,
  collection,
  updateDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [previousDiscipline, setPreviousDiscipline] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Available class names (for students)
  const availableClasses = ["BSCS", "BSIT", "BSSE", "BBA", "MBA"];

  // 🔹 Custom domain for email generation
  const emailDomain = "@web.com";

  const handleCnicChange = (e) => {
    // sirf digits rakho
    let value = e.target.value.replace(/\D/g, "");

    // 🔹 5 digits ke baad dash
    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    }

    // 🔹 13 digits me second dash 13th position pe aayega
    if (value.length > 13) {
      value = value.slice(0, 13) + "-" + value.slice(13);
    }

    // 🔹 max length 15 (example: 12345-6789012-3)
    if (value.length > 15) {
      value = value.slice(0, 15);
    }

    setCnic(value);
  };

  const handlePhoneChange = (e) => {
    // 🔹 sirf digits rakho
    let value = e.target.value.replace(/\D/g, "");

    // 🔹 4 digits ke baad dash add karo
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }

    // 🔹 max length: 12 (0300-1234567)
    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setPhone(value);
  };

  // 🔹 Generate random roll number
  const generateRollNumber = async () => {
    const counterRef = doc(db, "metadata", "rollNumberCounter");

    const docSnap = await getDoc(counterRef);

    if (docSnap.exists()) {
      const lastRoll = docSnap.data().lastRoll || 1000;
      const newRoll = lastRoll + 1;

      await updateDoc(counterRef, { lastRoll: newRoll });

      return newRoll.toString();
    } else {
      await setDoc(counterRef, { lastRoll: 1000 });
      return "1000";
    }
  };

  // 🔹 Suggest email based on name
  const handleNameChange = async (e) => {
    const inputName = e.target.value.trim();
    setName(inputName);

    if (inputName) {
      let baseEmail = inputName.toLowerCase().replace(/\s+/g, "");
      let emailSuggestion = `${baseEmail}${emailDomain}`;

      // Check if suggested email already exists in Firestore
      const q = query(
        collection(db, "users"),
        where("email", "==", emailSuggestion)
      );
      const querySnapshot = await getDocs(q);

      // If exists, append a number to make unique email
      if (!querySnapshot.empty) {
        let counter = 1;
        let newEmail = `${baseEmail}${counter}${emailDomain}`;
        while (
          !(
            await getDocs(
              query(collection(db, "users"), where("email", "==", newEmail))
            )
          ).empty
        ) {
          counter++;
          newEmail = `${baseEmail}${counter}${emailDomain}`;
        }
        emailSuggestion = newEmail;
      }

      setSuggestedEmail(emailSuggestion);
      setEmail(emailSuggestion);
    } else {
      setSuggestedEmail("");
      setEmail("");
    }
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Check if email already exists in Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setError("This email is already registered.");
        setLoading(false);
        return;
      }

      // Step 2: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Step 3: Generate roll number
      const rollNumber = await generateRollNumber();

      // Step 4: Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        address,
        phone,
        cnic,
        previousDiscipline,
        role,
        className: role === "student" ? className : null,
        rollNumber: role === "student" ? rollNumber : null,
        createdAt: new Date(),
      });

      // Step 5: Redirect based on role
      // if (role === "admin") router.push("/admin");
      // else if (role === "teacher") router.push("/teacher");
      // else router.push("/users");
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-body">
      <div className="signup">
        <h1>Create User</h1>
        <form onSubmit={handleSubmit}>
          {/* ---- Name & Email ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
              />
              <i className="fa-solid fa-user"></i>
              <label>Name</label>
            </div>

            <div className="input-box">
              {/* {suggestedEmail && (
               <p   style={{ color: "green", fontSize: "14px" }}>
                 Suggested Email: <strong>{suggestedEmail}</strong>
               </p>
            )} */}
              <input
                type="email"
                value={email}
                placeholder="Email (Auto Suggested)"
                readOnly
                required
              />
              {/* <i className="fa-solid fa-envelope"></i>
              <label>Email</label> */}
            </div>
          </div>

          {/* ---- Password & Address ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i className="fa-solid fa-key"></i>
              <label>Password</label>
            </div>

            <div className="input-box">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <i className="fa-solid fa-location-dot"></i>
              <label>Address</label>
            </div>
          </div>

          {/* ---- Phone ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={12}
              />
              <i className="fa-solid fa-phone"></i>
              <label>Phone</label>
            </div>

            {/* ---- CNIC ---- */}

            <div className="input-box">
              <input
                type="text"
                value={cnic}
                onChange={handleCnicChange}
                maxLength={15}
                required
              />
              <i className="fa-solid fa-id-card"></i>
              <label>CNIC Number</label>
            </div>
          </div>

          {/* ---- Previous Discipline ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="text"
                value={previousDiscipline}
                onChange={(e) => setPreviousDiscipline(e.target.value)}
                required
              />
              <i className="fa-solid fa-graduation-cap"></i>
              <label>College Discipline</label>
            </div>
          </div>

          {/* ---- Role Selection ---- */}
          <div className="selection-section">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            {/* ---- Class (only for students) ---- */}
            {role === "student" && (
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              >
                <option value="">Select Class</option>
                {availableClasses.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ---- Error message ---- */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* ---- Submit button ---- */}
          <div className="signup-bottom">
            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
