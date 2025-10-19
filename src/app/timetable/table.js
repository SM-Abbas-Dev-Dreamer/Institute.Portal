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
  DialogTrigger,
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
  const h = hour % 12 || 12; // convert 0 to 12
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

  // 24-hour slots converted to AM/PM
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

      // remove this class from teacher’s array in user doc
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

      // update timetable entry
      await updateDoc(entryRef, {
        ...updatedForm,
      });

      // update teacher’s record if class changes (optional sync)
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

  return (
    <Card className="shadow-md mt-[50px] text-3xl">
      <CardHeader>
        <CardTitle>{getClassName(selectedClass)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="styled-table w-full min-w-max border-collapse">
            <thead>
              <tr>
                <th className="text-white p-3 sticky left-0 z-999">Day / Time</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="text-white p-3">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="font-semibold day-table text-center p-2 sticky left-0 z-10">
                    {day}
                  </td>
                  {timeSlots.map((slot) => {
                    const startHour = slot.split(" - ")[0];
                    const startHour24 = parseInt(startHour.split(":")[0], 10) % 24;

                    const entries = timetable.filter(
                      (t) => t.day === day && parseInt(t.startTime.split(":")[0], 10) === startHour24
                    );

                    return (
                      <td
                        key={slot}
                        className={`text-sm text-center p-3 ${
                          entries.length > 0
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-gray-400 italic"
                        }`}
                      >
                        {entries.length > 0 ? (
                          entries.map((e, idx) => (
                            <div key={idx} className="space-y-1">
                              <div>
                                {e.courseTitle} ({e.teacherName})
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-center gap-2 mt-1">
                                <Button
                                  size="sm"
                                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                                  onClick={() => handleEdit(e)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(e)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          "Free"
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
              <div className="space-y-3">
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
                  onChange={(e) => setUpdatedForm({ ...updatedForm, day: e.target.value })}
                  placeholder="Day"
                />
              </div>
              <DialogFooter className="mt-4">
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
  );
}
