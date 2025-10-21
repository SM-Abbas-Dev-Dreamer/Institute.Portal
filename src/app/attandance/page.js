"use client";
import "./attend.css";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseconfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * AttendancePage (English-commented)
 *
 * Behavior:
 * - Teacher selects class, date, and subject
 * - Students list fetched for the selected class
 * - If attendance already exists for that teacher + class + subject + date, it is loaded for editing
 * - On submit:
 *    - attendance_teacher collection: document per (class_subject_date)
 *    - attendance_student collection: each student doc updated with attendance.date.subject = status
 *
 * Collections used:
 * - attendance_teacher
 * - attendance_student
 *
 * Note: setDoc(docRef, payload, { merge: true }) is used to avoid overwriting unrelated fields.
 */

export default function AttendancePage() {
  const [teacher, setTeacher] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // yyyy-mm-dd

  // column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    roll: true,
    status: true,
  });

  // sample subjects — you can make this dynamic (from timetable or teacher doc)
  const [subjectOptions] = useState([
    "Math",
    "English",
    "Physics",
    "Chemistry",
    "Computer",
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setTeacher(user);

        // Fetch assigned classes from teacher document
        const qTeacher = query(collection(db, "users"), where("email", "==", user.email));
        const teacherSnap = await getDocs(qTeacher);
        if (!teacherSnap.empty) {
          const teacherData = teacherSnap.docs[0].data();
          setAssignedClasses(teacherData.classes || []);
        }

        // Fetch recent attendance for this teacher
        fetchRecentAttendance(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load students when a class is selected
  const fetchStudents = async (className) => {
    setSelectedClass(className);
    setStudents([]);
    if (!className) return;

    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("className", "==", className)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(data);

    // Load attendance if it already exists
    loadAttendanceForDateSubject(className, selectedSubject, selectedDate, data);
  };

  // When date or subject changes, reload attendance (if class already selected)
  useEffect(() => {
    if (selectedClass) {
      loadAttendanceForDateSubject(selectedClass, selectedSubject, selectedDate, students);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedSubject]);

  // Load teacher attendance doc and populate attendance state
  const loadAttendanceForDateSubject = async (className, subject, date, studentList = null) => {
    // reset if no subject, date, or class
    if (!className || !subject || !date) {
      const initial = {};
      (studentList || students).forEach((s) => (initial[s.id] = ""));
      setAttendance(initial);
      return;
    }

    const docId = `${className}_${subject}_${date}`;
    const teacherDocRef = doc(db, "attendance_teacher", docId);
    const teacherDocSnap = await getDoc(teacherDocRef);

    // Ensure we have a student list
    let currStudents = studentList;
    if (!currStudents) {
      const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("className", "==", className)
      );
      const snapshot = await getDocs(q);
      currStudents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(currStudents);
    }

    // Default attendance map
    const initial = {};
    currStudents.forEach((s) => (initial[s.id] = ""));

    if (teacherDocSnap.exists()) {
      const data = teacherDocSnap.data();
      const records = data.records || {};
      Object.keys(records).forEach((sid) => {
        initial[sid] = records[sid].status || "";
      });
    }
    setAttendance(initial);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Submit attendance (create/update)
  const handleSubmit = async () => {
    if (!selectedClass) return alert("Please select a class first!");
    if (!selectedSubject) return alert("Please select a subject first!");
    if (!selectedDate) return alert("Please select a date first!");
    if (!teacher) return alert("Teacher not detected!");

    const docId = `${selectedClass}_${selectedSubject}_${selectedDate}`;
    const teacherDocRef = doc(db, "attendance_teacher", docId);

    const attendanceRecords = {};
    let currStudents = students;
    if (!currStudents || currStudents.length === 0) {
      const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("className", "==", selectedClass)
      );
      const qs = await getDocs(q);
      currStudents = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(currStudents);
    }

    currStudents.forEach((s) => {
      attendanceRecords[s.id] = {
        name: s.name || "",
        status: attendance[s.id] || "",
      };
    });

    await setDoc(
      teacherDocRef,
      {
        teacherEmail: teacher.email,
        teacherName: teacher.displayName || "Unknown",
        className: selectedClass,
        subject: selectedSubject,
        date: selectedDate,
        records: attendanceRecords,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const promises = currStudents.map(async (s) => {
      const studentDocRef = doc(db, "attendance_student", s.id);
      const nested = {
        studentId: s.id,
        studentName: s.name || "",
        className: selectedClass,
        attendance: {
          [selectedDate]: {
            [selectedSubject]: attendance[s.id] || "",
          },
        },
        updatedAt: new Date().toISOString(),
      };
      await setDoc(studentDocRef, nested, { merge: true });
    });

    await Promise.all(promises);

    alert("✅ Attendance saved/updated successfully!");
    fetchRecentAttendance(teacher.email);
  };

  // Fetch recent attendance by teacher
  const fetchRecentAttendance = async (teacherEmail) => {
    try {
      const q = query(
        collection(db, "attendance_teacher"),
        where("teacherEmail", "==", teacherEmail),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentAttendance(data);
    } catch (err) {
      console.error("Firestore index/query issue:", err);
    }
  };

  // helper counts
  const totalPresent = Object.values(attendance).filter((v) => v === "P").length;
  const totalAbsent = Object.values(attendance).filter((v) => v === "A").length;
  const totalLeave = Object.values(attendance).filter((v) => v === "L").length;

  // Load previous attendance record
  const handleLoadRecent = async (rec) => {
    setSelectedClass(rec.className || "");
    setSelectedSubject(rec.subject || "");
    setSelectedDate(rec.date || new Date().toISOString().split("T")[0]);
    await fetchStudents(rec.className || "");
  };

  return (
    <div className=" Attand-section">
      <Card className="Attand-section-box ">
        <CardContent className="space-y-4 ">
          {/* Top Controls */}
          <div className=" selection-boxes">
            {/* Class Select */}
            <Select
              value={selectedClass ? selectedClass : ""}
              onValueChange={(classId) => {
                const selected = assignedClasses.find((cls) => cls.id === classId);
                fetchStudents(selected?.name || "");
              }}
            >
              <SelectTrigger className="w-[300px] select-box">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {assignedClasses.map((cls, idx) => (
                  <SelectItem key={idx} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <div className="select-box" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label htmlFor="att-date">Date:</label>
              <input
                id="att-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input input-bordered"
              />
            </div>

            {/* Subject */}
            <div className="select-box" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Select
                value={selectedSubject}
                onValueChange={(val) => setSelectedSubject(val)}
              >
                <SelectTrigger className="w-[200px] select-box">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((s, i) => (
                    <SelectItem key={i} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Column Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="select-box" asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.name}
                  onCheckedChange={(v) =>
                    setVisibleColumns((prev) => ({ ...prev, name: !!v }))
                  }
                >
                  Student Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.roll}
                  onCheckedChange={(v) =>
                    setVisibleColumns((prev) => ({ ...prev, roll: !!v }))
                  }
                >
                  Roll Number
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.status}
                  onCheckedChange={(v) =>
                    setVisibleColumns((prev) => ({ ...prev, status: !!v }))
                  }
                >
                  Mark Attendance
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Students Table */}
          <div className="attend-table">
            {students.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.name && <TableHead className="attend-table-head">Student Name</TableHead>}
                      {visibleColumns.roll && <TableHead className="attend-table-head">Roll No</TableHead>}
                      {visibleColumns.status && (
                        <TableHead className="text-center attend-table-head ">
                          Mark Attendance
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        {visibleColumns.name && <TableCell>{s.name}</TableCell>}
                        {visibleColumns.roll && <TableCell>{s.rollNumber || "-"}</TableCell>}
                        {visibleColumns.status && (
                          <TableCell className="text-center space-x-2 table-buttons">
                            <Button
                              variant={attendance[s.id] === "P" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(s.id, "P")}
                            >
                              P
                            </Button>
                            <Button
                              variant={attendance[s.id] === "L" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(s.id, "L")}
                            >
                              L
                            </Button>
                            <Button
                              variant={attendance[s.id] === "A" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(s.id, "A")}
                            >
                              A
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Counts + Submit */}
                <div className="flex items-center justify-between mt-4 ">
                  <div className="flex gap-4">
                    <Badge className="table-bottom-bage" variant="outline"> Present: {totalPresent}</Badge>
                    <Badge className="table-bottom-bage" variant="outline"> Absent: {totalAbsent}</Badge>
                    <Badge className="table-bottom-bage" variant="outline"> Leave: {totalLeave}</Badge>
                  </div>
                  <Button onClick={handleSubmit}>Submit Attendance</Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Select a class to view students</p>
            )}
          </div>

          {/* Recent Attendance List */}
          <div>
            <h4 className="mb-2">Recent Attendance (Your recorded sessions)</h4>
            <div className="grid gap-2">
              {recentAttendance.length === 0 && <p className="text-muted-foreground">No recent records</p>}
              {recentAttendance.slice(0, 10).map((rec) => (
                <div key={rec.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div><strong>{rec.className}</strong> — {rec.subject}</div>
                    <div className="text-sm text-muted-foreground">{rec.date}</div>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => handleLoadRecent(rec)}>Load</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
