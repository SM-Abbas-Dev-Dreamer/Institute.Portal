"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import "./navbar.css";

const Navbar = () => {
  const [role, setRole] = useState("");
  const [links, setLinks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null); // ✅ menu container ref

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Navbar link data (role-based)
  const navLinks = {
    admin: [
      { name: "Time Table", path: "/timetable" },
      { name: "Create Class", path: "/createclass" },
      { name: "Create User", path: "/signup" },
    ],
    teacher: [
      { name: "Attendance", path: "/attandance" },
      { name: "Assignments", path: "/uploadassigment" },
    ],
    student: [
      { name: "Result", path: "/result" },
      { name: "Fee", path: "/fee" },
      { name: "Assignments", path: "/assigment" },
      { name: "Attendance", path: "/attendance" },
      { name: "Application", path: "/application" },
    ],
  };

  // 🔹 Get user role from Firestore
  useEffect(() => {
    const fetchUserRole = async (uid) => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role);
        setLinks(navLinks[userData.role] || []);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid);
      } else {
        setRole("");
        setLinks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="navbar">
      <div className="logo">
        <Link href="/">LOGO</Link>
      </div>

      {/* ✅ Attach ref here */}
      <div ref={menuRef} className={`navigation ${menuOpen ? "active" : ""}`}>
        <ul className="nav-links">
          {links.length > 0
            ? links.map((link, index) => (
                <li key={index}>
                  <Link href={link.path}>{link.name}</Link>
                </li>
              ))
            : null}
        </ul>

        {isLoggedIn ? (
          <Link href="/profile">
            <div className="login-btn">
              <i className="fa-solid fa-user"></i>
            </div>
          </Link>
        ) : null}

        <div className="close-hamburger" onClick={toggleMenu}>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
    </div>
  );
};

export default Navbar;
