"use client";
import "./TimetableTable.css";
import { useState } from "react";
import { db } from "../../../firebaseconfig";
import {
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// helper function to convert 24h to 12h AM/PM
const formatTime = (hour) => {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

export default function TimetableTable({ timetable, selectedClass, classes }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [updatedForm, setUpdatedForm] = useState({
    courseTitle: "",
    startTime: "",
    endTime: "",
    day: "",
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return `${formatTime(i)} - ${formatTime(i + 1)}`;
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getClassName = (classId) => {
    return classes.find((c) => c.id === classId)?.className || "";
  };

  // 🔹 Delete timetable entry
  const handleDelete = async (entry) => {
    try {
      await deleteDoc(doc(db, "timetables", entry.id));
      const teacherRef = doc(db, "users", entry.teacherId);
      await updateDoc(teacherRef, {
        classes: arrayRemove(entry.classId),
      });
      alert("Timetable entry deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete timetable entry!");
    }
  };

  // 🔹 Start editing
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setUpdatedForm({
      courseTitle: entry.courseTitle,
      startTime: entry.startTime,
      endTime: entry.endTime,
      day: entry.day,
    });
  };

  // 🔹 Save edited data
  const handleUpdate = async () => {
    if (!editingEntry) return;
    try {
      const entryRef = doc(db, "timetables", editingEntry.id);
      await updateDoc(entryRef, { ...updatedForm });
      const teacherRef = doc(db, "users", editingEntry.teacherId);
      await updateDoc(teacherRef, {
        classes: arrayUnion(editingEntry.classId),
      });
      alert("Timetable updated successfully!");
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update timetable entry!");
    }
  };

  // 🔹 Handle cell tap (for mobile)
  const handleCellClick = (e) => {
    document.querySelectorAll(".time-cell.active").forEach((cell) => {
      if (cell !== e.currentTarget) cell.classList.remove("active");
    });
    e.currentTarget.classList.toggle("active");
  };

  return (
    <div className="timetable-card-outer">
      <Card className="timetable-card">
        <CardHeader>
          <CardTitle className="timetable-title">{getClassName(selectedClass)}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="table-container">
            <table className="timetable-table">
              <thead>
                <tr>
                  <th className="day-header">Day / Time</th>
                  {timeSlots.map((slot) => (
                    <th key={slot} className="time-header">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="day-column">{day}</td>
                    {timeSlots.map((slot) => {
                      const startHour = slot.split(" - ")[0];
                      const startHour24 = parseInt(startHour.split(":")[0], 10) % 24;

                      const entries = timetable.filter(
                        (t) =>
                          t.day === day &&
                          parseInt(t.startTime.split(":")[0], 10) === startHour24
                      );

                      return (
                        <td
                          key={slot}
                          className={`time-cell ${
                            entries.length > 0 ? "occupied" : "free"
                          }`}
                          onClick={handleCellClick}
                        >
                          {entries.length > 0 ? (
                            entries.map((e, idx) => (
                              <div key={idx} className="entry-box">
                                <div className="entry-info">
                                  {e.courseTitle} ({e.teacherName})
                                </div>
                                <div className="entry-actions">
                                  <Button size="sm" className="edit-btn" onClick={() => handleEdit(e)}>
                                    <i className="fa-solid fa-pencil"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="delete-btn"
                                    onClick={() => handleDelete(e)}
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="free-text">Free</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 Edit Dialog */}
          {editingEntry && (
            <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Timetable</DialogTitle>
                </DialogHeader>

                <div className="edit-form">
                  <Input
                    type="text"
                    value={updatedForm.courseTitle}
                    onChange={(e) =>
                      setUpdatedForm({ ...updatedForm, courseTitle: e.target.value })
                    }
                    placeholder="Course Title"
                  />
                  <Input
                    type="time"
                    value={updatedForm.startTime}
                    onChange={(e) =>
                      setUpdatedForm({ ...updatedForm, startTime: e.target.value })
                    }
                  />
                  <Input
                    type="time"
                    value={updatedForm.endTime}
                    onChange={(e) =>
                      setUpdatedForm({ ...updatedForm, endTime: e.target.value })
                    }
                  />
                  <Input
                    type="text"
                    value={updatedForm.day}
                    onChange={(e) =>
                      setUpdatedForm({ ...updatedForm, day: e.target.value })
                    }
                    placeholder="Day"
                  />
                </div>

                <DialogFooter className="dialog-footer">
                  <DialogClose asChild>
                    <Button variant="outline" className="cancel-btn">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button onClick={handleUpdate} className="save-btn">
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
