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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    suggestedEmail: "",
    password: "",
    role: "student",
    address: "",
    phone: "",
    cnic: "",
    previousDiscipline: "",
    className: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Available class names (for students)
  const availableClasses = ["BSCS", "BSIT", "BSSE", "BBA", "MBA"];

  // 🔹 Custom domain for email generation
  const emailDomain = "@web.com";

  // 🔹 Universal input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 CNIC format handler
  const handleCnicChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    }

    if (value.length > 13) {
      value = value.slice(0, 13) + "-" + value.slice(13);
    }

    if (value.length > 15) {
      value = value.slice(0, 15);
    }

    setFormData((prev) => ({ ...prev, cnic: value }));
  };

  // 🔹 Phone format handler
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }

    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setFormData((prev) => ({ ...prev, phone: value }));
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
    setFormData((prev) => ({ ...prev, name: inputName }));

    if (inputName) {
      let baseEmail = inputName.toLowerCase().replace(/\s+/g, "");
      let emailSuggestion = `${baseEmail}${emailDomain}`;

      const q = query(
        collection(db, "users"),
        where("email", "==", emailSuggestion)
      );
      const querySnapshot = await getDocs(q);

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

      setFormData((prev) => ({
        ...prev,
        email: emailSuggestion,
        suggestedEmail: emailSuggestion,
      }));
    } else {
      setFormData((prev) => ({ ...prev, email: "", suggestedEmail: "" }));
    }
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Check if email already exists in Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (methods.length > 0) {
        setError("This email is already registered.");
        setLoading(false);
        return;
      }

      // Step 2: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Step 3: Generate roll number
      const rollNumber = await generateRollNumber();

      // Step 4: Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        cnic: formData.cnic,
        previousDiscipline: formData.previousDiscipline,
        role: formData.role,
        className: formData.role === "student" ? formData.className : null,
        rollNumber: formData.role === "student" ? rollNumber : null,
        createdAt: new Date(),
      });

      // Step 5: Redirect based on role (commented same as before)
      // if (formData.role === "admin") router.push("/admin");
      // else if (formData.role === "teacher") router.push("/teacher");
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
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
              <i className="fa-solid fa-user"></i>
              <label>Name</label>
            </div>

            <div className="input-box">
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email (Auto Suggested)"
                readOnly
                required
              />
            </div>
          </div>

          {/* ---- Password & Address ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <i className="fa-solid fa-key"></i>
              <label>Password</label>
            </div>

            <div className="input-box">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
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
                name="phone"
                value={formData.phone}
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
                name="cnic"
                value={formData.cnic}
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
                name="previousDiscipline"
                value={formData.previousDiscipline}
                onChange={handleInputChange}
                required
              />
              <i className="fa-solid fa-graduation-cap"></i>
              <label>College Discipline</label>
            </div>
          </div>

          {/* ---- Role Selection ---- */}
          <div className="selection-section">
            {/* ---- Role Selection ---- */}
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="w-[180px] select-triger ">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="  " >
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* ---- Class Selection (only for students) ---- */}
            {formData.role === "student" && (
              <Select
                value={formData.className}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, className: value }))
                }
              >
                <SelectTrigger className="w-[180px] select-triger">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {availableClasses.map((cls, index) => (
                      <SelectItem key={index} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
