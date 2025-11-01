"use client";
import React, { useState } from "react";
import "./signup.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertTitle } from "../../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { createUserApi } from "../../lib/signup/signupApi";
import { suggestEmail } from "../../lib/signup/route";
import { useEffect } from "react";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    setValue("role", "student");
  }, [setValue]);

  const availableClasses = ["BSCS", "BSIT", "BSSE", "BBA", "MBA"];
  const role = watch("role", "student");

  const handleNameChange = async (e) => {
    const name = e.target.value;
    setValue("name", name);
    if (name.trim()) {
      const suggested = await suggestEmail(name);
      setValue("email", suggested);
    } else {
      setValue("email", "");
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    // ✅ Ensure default role
    if (!data.role) data.role = "student";

    console.log("📤 Signup data before sending:", data);

    try {
      await createUserApi(data);
      router.push("/users"); // redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- format handlers ---
  const formatCnic = (value) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    if (v.length > 13) v = v.slice(0, 13) + "-" + v.slice(13);
    return v.slice(0, 15);
  };
  const formatPhone = (value) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4) + "-" + v.slice(4);
    return v.slice(0, 12);
  };

  return (
    <div className="signup-body">
      <div className="signup">
        <h1>Create User</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ---- Name & Email ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="text"
                required
                {...register("name", { required: "Name is required" })}
                onChange={handleNameChange}
              />
              <i className="fa-solid fa-user"></i>
              <label>Name</label>
            </div>

            <div className="input-box">
              <input
                type="email"
                required
                {...register("email")}
                readOnly
                placeholder="Email (Auto Suggested)"
              />
            </div>
          </div>

          {/* ---- Password & Address ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="password"
                required
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <i className="fa-solid fa-key"></i>
              <label>Password</label>
            </div>

            <div className="input-box">
              <input
                type="text"
                required
                {...register("address", { required: "Address is required" })}
              />
              <i className="fa-solid fa-location-dot"></i>
              <label>Address</label>
            </div>
          </div>

          {/* ---- Phone & CNIC ---- */}
          <div className="input-line-layout">
            <div className="input-box">
              <input
                type="text"
                required
                {...register("phone", { required: "Phone number is required" })}
                onChange={(e) => setValue("phone", formatPhone(e.target.value))}
                maxLength={12}
              />
              <i className="fa-solid fa-phone"></i>
              <label>Phone</label>
            </div>

            <div className="input-box">
              <input
                type="text"
                required
                {...register("cnic", { required: "CNIC is required" })}
                onChange={(e) => setValue("cnic", formatCnic(e.target.value))}
                maxLength={15}
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
                {...register("previousDiscipline", {
                  required: "Previous discipline is required",
                })}
              />
              <i className="fa-solid fa-graduation-cap"></i>
              <label>College Discipline</label>
            </div>
          </div>

          {/* ---- Role Selection ---- */}
          <div className="selection-section">
            <Select
              value={role}
              onValueChange={(value) => setValue("role", value)}
            >
              <SelectTrigger className="w-[180px] select-triger">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {role === "student" && (
              <Select onValueChange={(value) => setValue("className", value)}>
                <SelectTrigger className="w-[180px] select-triger">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {availableClasses.map((cls, i) => (
                      <SelectItem key={i} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ---- Error Message ---- */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* ---- Submit Button ---- */}
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
