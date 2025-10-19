"use client";
import "./attend.css"
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseconfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AttendancePage() {
  const [teacher, setTeacher] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // ✅ New state for column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    roll: true,
    status: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setTeacher(user);

        const qTeacher = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const teacherSnap = await getDocs(qTeacher);
        if (!teacherSnap.empty) {
          const teacherData = teacherSnap.docs[0].data();
          setAssignedClasses(teacherData.classes || []);
        }

        fetchRecentAttendance(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

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

    const initialAttendance = {};
    data.forEach((s) => (initialAttendance[s.id] = ""));
    setAttendance(initialAttendance);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return alert("Select a class first!");
    if (!teacher) return alert("Teacher not detected!");

    const today = new Date().toISOString().split("T")[0];

    const attendanceRecords = {};
    students.forEach((s) => {
      attendanceRecords[s.id] = {
        name: s.name,
        status: attendance[s.id],
      };
    });

    await addDoc(collection(db, "attendance"), {
      className: selectedClass,
      teacherName: teacher.displayName || "Unknown",
      teacherEmail: teacher.email,
      date: today,
      records: attendanceRecords,
    });

    alert("✅ Attendance Submitted Successfully!");
    setStudents([]);
    setSelectedClass("");
    setAttendance({});
    fetchRecentAttendance(teacher.email);
  };

  const fetchRecentAttendance = async (teacherEmail) => {
    try {
      const q = query(
        collection(db, "attendance"),
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
      console.error(
        "⚠️ Firestore index missing. Create it in Firebase console."
      );
    }
  };

  const totalPresent = Object.values(attendance).filter(
    (v) => v === "P"
  ).length;
  const totalAbsent = Object.values(attendance).filter((v) => v === "A").length;
  const totalLeave = Object.values(attendance).filter((v) => v === "L").length;

  return (
    <div className=" Attand-section">
      <Card className="Attand-section-box" >

        <CardContent className="space-y-4 ">
          {/* Class Select */}
          <div className=" selection-boxes ">
            <Select
              value={selectedClass}
              onValueChange={(classId) => {
                const selected = assignedClasses.find(
                  (cls) => cls.id === classId
                );
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
            {/* ✅ Column Filter Dropdown */}
            <DropdownMenu >
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
                    {visibleColumns.name && <TableHead className="attend-table-head" >Student Name</TableHead>}
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
                      {visibleColumns.roll && (
                        <TableCell>{s.rollNumber}</TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell className="text-center space-x-2 table-buttons">
                          <Button
                            variant={
                              attendance[s.id] === "P" ? "default" : "outline"
                            }
                            onClick={() => handleAttendanceChange(s.id, "P")}
                          >
                            P
                          </Button>
                          <Button
                            variant={
                              attendance[s.id] === "L" ? "default" : "outline"
                            }
                            onClick={() => handleAttendanceChange(s.id, "L")}
                          >
                            L
                          </Button>
                          <Button
                            variant={
                              attendance[s.id] === "A" ? "default" : "outline"
                            }
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
            <p className="text-muted-foreground">
              Select a class to view students
            </p>
          )}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
