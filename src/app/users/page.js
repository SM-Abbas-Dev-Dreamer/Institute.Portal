"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebaseconfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import "./allusers.css";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterClass, setFilterClass] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    className: "",
  });

  // 🔹 Classes array
  const classes = ["BSCS", "BSIT", "BBA", "MBA", "ICS", "FSC"];

  // 🔹 Fetch all users
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setMessage("✅ Role updated successfully!");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage("❌ Failed to update role!");
    }
  };

  // 🔹 Delete user (Auth + Firestore)
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      setUsers(users.filter((user) => user.id !== userId));
      setMessage("✅ User deleted successfully (from Firestore).");
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("❌ Failed to delete user!");
    }
  };

  // 🔹 Stuck Off user
  const handleStuckOff = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { activity: "stuckoff" });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, activity: "stuckoff" } : user
        )
      );
      setMessage("⚠️ User has been stuck off.");
    } catch (error) {
      console.error("Error marking stuck off:", error);
      setMessage("❌ Failed to stuck off user!");
    }
  };

  // 🔹 Remove Stuck Off
  const handleRemoveStuckOff = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { activity: "active" });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, activity: "active" } : user
        )
      );
      setMessage("✅ User reactivated successfully.");
    } catch (error) {
      console.error("Error removing stuck off:", error);
      setMessage("❌ Failed to reactivate user!");
    }
  };

  // 🔹 Open Edit Modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      className: user.className || "",
    });
  };

  // 🔹 Handle edit input
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save edit
  const saveEdit = async () => {
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        className: editForm.className,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...editForm } : u
        )
      );
      setMessage("✅ User updated successfully!");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("❌ Failed to update user!");
    }
  };

  // 🔹 Filter users
  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;
    if (filterRole === "student" && filterClass && user.className !== filterClass)
      return false;
    return true;
  });

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading users...</h2>;

  return (
    <div className="all-users-body">
      <h1>All Users</h1>
      {message && <p className="message">{message}</p>}

      {/* 🔹 Filter Controls */}
      <div className="filter-section">
        <label>Filter by Role:</label>
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setFilterClass("");
          }}
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>

        {/* 🔹 Class filter only when student selected */}
        {filterRole === "student" && (
          <>
            <label>Filter by Class:</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* 🔹 Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Class</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="7">No users found</td>
            </tr>
          ) : (
            filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name || "N/A"}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.className || "N/A"}</td>
                <td>
                  {user.activity === "stuckoff" ? (
                    <span style={{ color: "red" }}>Stuck Off</span>
                  ) : (
                    <span style={{ color: "green" }}>Active</span>
                  )}
                </td>
                <td>
                  <button onClick={() => openEditModal(user)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>

                  {user.activity === "stuckoff" ? (
                    <button onClick={() => handleRemoveStuckOff(user.id)}>
                      Remove Stuck Off
                    </button>
                  ) : (
                    <button onClick={() => handleStuckOff(user.id)}>
                      Stuck Off
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🔹 Edit Modal */}
      {editingUser && (
        <div className="edit-modal">
          <div className="edit-box">
            <h2>Edit User</h2>
            <label>Name:</label>
            <input
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
            />
            <label>Email:</label>
            <input
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
            />
            <label>Role:</label>
            <select
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            {editForm.role === "student" && (
              <>
                <label>Class:</label>
                <select
                  name="className"
                  value={editForm.className}
                  onChange={handleEditChange}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="edit-actions">
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
