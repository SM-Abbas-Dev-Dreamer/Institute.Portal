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
import "./allusers.css";

// 🔹 Shadcn components import
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

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

  const classes = ["BSCS", "BSIT", "BBA", "MBA", "ICS", "FSC"];

  // 🔹 Columns setup for show/hide
  const allColumns = [
    "Name",
    "Email",
    "Role",
    "Class",
    "Status",
    "Actions",
  ];
  const [visibleColumns, setVisibleColumns] = useState(allColumns);

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

  // 🔹 Delete user
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

  const handleEditChange = (name, value) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save edit
  const saveEdit = async () => {
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, { ...editForm });
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u))
      );
      setMessage("✅ User updated successfully!");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("❌ Failed to update user!");
    }
  };

  // 🔹 Filtered users
  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;
    if (filterRole === "student" && filterClass && user.className !== filterClass)
      return false;
    return true;
  });

  // 🔹 Toggle columns visibility
  const handleColumnToggle = (value) => {
    setVisibleColumns((prev) =>
      prev.includes(value)
        ? prev.filter((col) => col !== value)
        : [...prev, value]
    );
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading users...</h2>;

  return (
    <div className="all-users-body">
      <h1>All Users</h1>
      {message && <p className="message">{message}</p>}

      {/* 🔹 Filter Section */}
      <div className="filter-section flex justify-center gap-7 my-5 ">
        <Select
          value={filterRole}
          onValueChange={(value) => {
            setFilterRole(value);
            setFilterClass("");
          }}
        >
          <SelectTrigger className="w-[180px] select-triger">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        {filterRole === "student" && (
          <Select
            value={filterClass}
            onValueChange={(value) => setFilterClass(value)}
          >
            <SelectTrigger className="w-[180px] select-triger">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls, index) => (
                <SelectItem key={index} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 🔹 Column Visibility Filter */}
        <Select
          onValueChange={(value) => handleColumnToggle(value)}
        >
          <SelectTrigger className="w-[220px] select-triger">
            <SelectValue placeholder="Toggle Columns" />
          </SelectTrigger>
          <SelectContent>
            {allColumns.map((col, index) => (
              <SelectItem key={index} value={col}>
                {visibleColumns.includes(col) ? `✅ ${col}` : col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 🔹 Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            {visibleColumns.includes("Name") && <th>Name</th>}
            {visibleColumns.includes("Email") && <th>Email</th>}
            {visibleColumns.includes("Role") && <th>Role</th>}
            {visibleColumns.includes("Class") && <th>Class</th>}
            {visibleColumns.includes("Status") && <th>Status</th>}
            {visibleColumns.includes("Actions") && <th>Actions</th>}
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
                {visibleColumns.includes("Name") && (
                  <td>{user.name || "N/A"}</td>
                )}
                {visibleColumns.includes("Email") && <td>{user.email}</td>}
                {visibleColumns.includes("Role") && <td>{user.role}</td>}
                {visibleColumns.includes("Class") && (
                  <td>{user.className || "N/A"}</td>
                )}
                {visibleColumns.includes("Status") && (
                  <td>
                    {user.activity === "stuckoff" ? (
                      <span style={{ color: "red" }}>Stuck Off</span>
                    ) : (
                      <span style={{ color: "green" }}>Active</span>
                    )}
                  </td>
                )}
                {visibleColumns.includes("Actions") && (
                  <td>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => openEditModal(user)}>
                            <i className="fa-solid fa-pencil p-2.5 bg-gray-800 text-amber-50 mx-1 rounded-2xl cursor-pointer"></i>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => handleDelete(user.id)}>
                            <i className="fa-solid fa-trash p-2.5 bg-gray-800 text-white mx-1 rounded-2xl cursor-pointer"></i>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          {user.activity === "stuckoff" ? (
                            <button onClick={() => handleRemoveStuckOff(user.id)}>
                              <i className="fa-solid fa-user-check p-2.5 bg-gray-800 text-white mx-1 rounded-2xl cursor-pointer"></i>
                            </button>
                          ) : (
                            <button onClick={() => handleStuckOff(user.id)}>
                              <i className="fa-solid fa-ban p-2.5 bg-gray-800 text-white mx-1 rounded-2xl cursor-pointer"></i>
                            </button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {user.activity === "stuckoff"
                            ? "Remove Stuck Off"
                            : "Stuck Off"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                )}
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
              onChange={(e) => handleEditChange("name", e.target.value)}
            />
            <label>Email:</label>
            <input
              name="email"
              value={editForm.email}
              onChange={(e) => handleEditChange("email", e.target.value)}
            />
            <label>Role:</label>
            <Select
              value={editForm.role}
              onValueChange={(value) => handleEditChange("role", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {editForm.role === "student" && (
              <>
                <label>Class:</label>
                <Select
                  value={editForm.className}
                  onValueChange={(value) =>
                    handleEditChange("className", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls, index) => (
                      <SelectItem key={index} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
