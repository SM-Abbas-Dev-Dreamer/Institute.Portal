"use client";
import { useState } from "react";
import { db } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import ClassSelect from "../components/selectclass/page";
import "./TimetableForm.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TimetableForm({ teachers }) {
  // 🧩 Toast system (Custom — No dependency)
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [form, setForm] = useState({
    courseTitle: "",
    teacherId: "",
    day: "",
    startTime: "",
    endTime: "",
    classId: "",
  });

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.classId)
      return triggerToast("Please select a class first!", "error");

    if (!form.teacherId)
      return triggerToast("Please select a teacher!", "error");

    try {
      const { classId, teacherId, day, startTime, endTime, courseTitle } = form;
      const startMin = toMinutes(startTime);
      const endMin = toMinutes(endTime);

      if (endMin <= startMin)
        return triggerToast("End time must be greater than start time.", "error");

      // 🔹 Step 1: Get className
      const classDoc = await getDoc(doc(db, "classes", classId));
      const className = classDoc.exists()
        ? classDoc.data().className
        : "Unknown Class";

      // 🔹 Step 2: Teacher Conflict
      const teacherBusyQuery = query(
        collection(db, "timetables"),
        where("teacherId", "==", teacherId),
        where("day", "==", day)
      );
      const teacherBusySnap = await getDocs(teacherBusyQuery);

      const teacherConflict = teacherBusySnap.docs.find((docSnap) => {
        const data = docSnap.data();
        const dbStart = toMinutes(data.startTime);
        const dbEnd = toMinutes(data.endTime);
        return startMin < dbEnd && endMin > dbStart;
      });

      if (teacherConflict) {
        const busyClass = teacherConflict.data().className || "another class";
        return triggerToast(
          `Teacher is already taking class in "${busyClass}" at that time.`,
          "error"
        );
      }

      // 🔹 Step 3: Class Conflict
      const classBusyQuery = query(
        collection(db, "timetables"),
        where("classId", "==", classId),
        where("day", "==", day)
      );
      const classBusySnap = await getDocs(classBusyQuery);

      const classConflict = classBusySnap.docs.find((docSnap) => {
        const data = docSnap.data();
        const dbStart = toMinutes(data.startTime);
        const dbEnd = toMinutes(data.endTime);
        return startMin < dbEnd && endMin > dbStart;
      });

      if (classConflict) {
        const busyTeacher = classConflict.data().teacherName || "another teacher";
        return triggerToast(
          `This class already has a session with "${busyTeacher}" at that time.`,
          "error"
        );
      }

      // 🔹 Step 4: Save timetable
      const selectedTeacher = teachers.find((t) => t.id === teacherId);
      const teacherName =
        selectedTeacher?.name ||
        selectedTeacher?.fullName ||
        selectedTeacher?.email ||
        "Unknown Teacher";

      await addDoc(collection(db, "timetables"), {
        ...form,
        teacherName,
        className,
        createdAt: new Date().toISOString(),
      });

      // 🔹 Step 5: Update teacher's `classes`
      const teacherRef = doc(db, "users", teacherId);
      await updateDoc(teacherRef, {
        classes: arrayUnion({ id: classId, name: className }),
      });

      triggerToast("Timetable added successfully!", "success");

      // Reset form
      setForm({
        courseTitle: "",
        teacherId: "",
        day: "",
        startTime: "",
        endTime: "",
        classId: "",
      });
    } catch (error) {
      console.error("Error adding timetable:", error);
      triggerToast("Failed to add timetable. Please try again.", "error");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="table-form">
        {/* Course Title */}
        <div className="input-box">
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={form.courseTitle}
            onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
            required
          />
          <label>Course Title</label>
        </div>

        {/* Class Select */}
        <div>
          <ClassSelect
            selectedClass={form.classId}
            triggerClass="table-form-trigger"
            contentClass="table-form-content"
            itemClass="table-form-item"
            setSelectedClass={(val) => setForm({ ...form, classId: val })}
          />
        </div>

        {/* Teacher */}
        <div>
          <Select
            value={form.teacherId}
            onValueChange={(val) => setForm({ ...form, teacherId: val })}
          >
            <SelectTrigger className="w-full border rounded-lg p-2">
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name || t.fullName || t.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Day */}
        <div>
          <Select
            value={form.day}
            onValueChange={(val) => setForm({ ...form, day: val })}
          >
            <SelectTrigger className="day-select">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Time */}
        <div className="table-time">
          <div className="time">
            <label>Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="time">
            <label>End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <Button type="submit" className="mt-3">
          Add Timetable
        </Button>
      </form>

      {/* ✅ Custom Toast UI */}
      {showToast && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white z-[9999] transition-all duration-300 ${
            toastType === "success"
              ? "bg-green-500"
              : toastType === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
