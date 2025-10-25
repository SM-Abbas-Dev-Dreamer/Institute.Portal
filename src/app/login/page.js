"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css"
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
import Alert from "@mui/material/Alert";

const LogIn = () => {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const role = watch("role") || "student";

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Login failed");
      }

      router.push("/");
    } catch (err) {
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
