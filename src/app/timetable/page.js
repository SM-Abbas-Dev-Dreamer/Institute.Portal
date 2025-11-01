"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseconfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import TimetableForm from "./timetableform";
import TimetableTable from "./table";
import ClassSelect from "../components/selectclass/classSelect";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import "./AdminTimetablePage.css";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // 🔹 Fetch Classes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Teachers (role === teacher)
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsub = onSnapshot(q, (snap) => {
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Timetable for selected class
  useEffect(() => {
    if (!selectedClass) return setTimetable([]);
    const q = query(
      collection(db, "timetables"),
      where("classId", "==", selectedClass)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTimetable(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedClass]);

  return (
    <div className="p-6 space-y-6">
      {/* ---- Form to Add Timetable ---- */}
      <div className="table-header">
        <Dialog className="Create-class-btn">
          <DialogTrigger asChild>
            <Button className="create-class-btn" variant="outline">
              Create Time Table
            </Button>
          </DialogTrigger>
          <DialogContent className="form-dialog">
            <DialogHeader className="form-dialog-header" >
              <Card className="form-dialog-card">
                <CardHeader>
                  <CardTitle className="form-title" >Add Timetable Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <TimetableForm
                    teachers={teachers}
                    selectedClass={selectedClass}
                  />
                </CardContent>
              </Card>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ---- Class Selection ---- */}
        <ClassSelect
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          triggerClass="table-trigger"
          contentClass="table-content"
          itemClass="table-item"
        />
      </div>

      {/* ---- Timetable Table ---- */}
      {selectedClass && timetable.length > 0 ? (
        <TimetableTable
          timetable={timetable}
          selectedClass={selectedClass}
          classes={classes}
        />
      ) : selectedClass ? (
        <p className="text-center text-gray-500">
          No timetable added yet for this class.
        </p>
      ) : (
        <p className="text-center text-gray-500">
          Please select a class to view timetable.
        </p>
      )}
    </div>
  );
}
