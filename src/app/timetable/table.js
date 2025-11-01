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
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:30 - 14:30",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getClassName = (classId) => {
    return classes.find((c) => c.id === classId)?.className || "";
  };

  const handleDelete = async (entry) => {
    try {
      await deleteDoc(doc(db, "timetables", entry.id));
      const teacherRef = doc(db, "users", entry.teacherId);
      await updateDoc(teacherRef, { classes: arrayRemove(entry.classId) });
      alert("Timetable entry deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete timetable entry!");
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setUpdatedForm({
      courseTitle: entry.courseTitle,
      startTime: entry.startTime,
      endTime: entry.endTime,
      day: entry.day,
    });
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    try {
      const entryRef = doc(db, "timetables", editingEntry.id);
      await updateDoc(entryRef, { ...updatedForm });
      const teacherRef = doc(db, "users", editingEntry.teacherId);
      await updateDoc(teacherRef, { classes: arrayUnion(editingEntry.classId) });
      alert("Timetable updated successfully!");
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update timetable entry!");
    }
  };

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
                  <th>Days / Time</th>
                  {timeSlots.map((slot) => (
                    <th key={slot}>{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <th>{day}</th>
                    {timeSlots.map((slot) => {
                      const entries = timetable.filter(
                        (t) => t.day === day && `${t.startTime} - ${t.endTime}` === slot
                      );
                      return (
                        <td
                          key={slot}
                          className={`time-cell ${entries.length > 0 ? "occupied" : "free"}`}
                          onClick={handleCellClick}
                        >
                          {entries.length > 0 ? (
                            entries.map((e, idx) => (
                              <div key={idx} className="lesson">
                                <div className="subject">{e.courseTitle}</div>
                                <div className="meta">{e.teacherName}</div>
                                <div className="entry-actions">
                                  <Button size="sm" className="edit-btn" onClick={() => handleEdit(e)}>
                                    ✏️
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="delete-btn"
                                    onClick={() => handleDelete(e)}
                                  >
                                    🗑️
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
                    onChange={(e) => setUpdatedForm({ ...updatedForm, courseTitle: e.target.value })}
                    placeholder="Course Title"
                  />
                  <Input
                    type="time"
                    value={updatedForm.startTime}
                    onChange={(e) => setUpdatedForm({ ...updatedForm, startTime: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={updatedForm.endTime}
                    onChange={(e) => setUpdatedForm({ ...updatedForm, endTime: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={updatedForm.day}
                    onChange={(e) => setUpdatedForm({ ...updatedForm, day: e.target.value })}
                    placeholder="Day"
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}