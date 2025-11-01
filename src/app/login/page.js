"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Loading3 from "../components/loading/loading3";
import Alert from "../../components/ui/alert";

const LogIn = () => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const role = watch("role") || "student";

  // ✅ Default role set on mount
  useEffect(() => {
    setValue("role", "student");
  }, [setValue]);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    // ✅ Ensure role is always "student" if not selected
    if (!data.role) data.role = "student";

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Login failed");

      // ✅ Save UID & role in localStorage
      localStorage.setItem("userUID", result.uid);
      localStorage.setItem("userRole", result.role);

      console.log("✅ Login Successful!");
      console.log("UID:", result.uid);
      console.log("Name:", result.user.name);
      console.log("Email:", result.user.email);
      console.log("Role:", result.role);

      router.push("/");
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-sheet"></div>
      <div className="login">
        <h1>Log In</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              type="email"
              {...register("email", { required: true })}
              required
            />
            <i className="fa fa-user"></i>
            <label>Email</label>
          </div>

          <div className="input-box">
            <input
              type="password"
              {...register("password", { required: true })}
              required
            />
            <i className="fa fa-lock"></i>
            <label>Password</label>
          </div>

          <Select
            value={role}
            onValueChange={(value) => setValue("role", value)}
          >
            <SelectTrigger className="role-select-trigger">
              <SelectValue placeholder="Select Role" />
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

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <p className="text-red-600">Email or Password invalid</p>
            </Alert>
          )}

          <div className="login-bottom">
            <div className="forget-password">
              <Link href="/reset">Forget Password?</Link>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex gap-1">
                  Submitting.
                  <Loading3 />
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
