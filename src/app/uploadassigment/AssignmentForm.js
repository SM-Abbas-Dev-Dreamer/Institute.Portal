"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../../firebaseconfig";
import "./AssignmentPage.css"
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function AssignmentForm() {
  const [teacher, setTeacher] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [className, setClassName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [deadline, setDeadline] = useState("");
  const [allClasses, setAllClasses] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTeacher({
          name: user.displayName || "Unknown",
          email: user.email,
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        const classesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllClasses(classesData);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacher) return alert("Please login first");
    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        rules,
        className,
        totalMarks,
        deadline,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        createdAt: new Date().toISOString(),
      });
      alert("✅ Assignment created successfully!");
      setTitle("");
      setDescription("");
      setRules("");
      setClassName("");
      setTotalMarks("");
      setDeadline("");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save assignment");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md assigment-section">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Create Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              type="text"
              className="assignment-input"
              placeholder="Assignment Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              className="assignment-input text"
              placeholder="Assignment Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rules</Label>
            <Textarea
              className="assignment-input text"
              placeholder="Rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Total Marks</Label>
            <Input
              className="assignment-input"
              type="number"
              placeholder="Total Marks"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Select Class</Label>
            <Select onValueChange={setClassName} value={className}>
              <SelectTrigger className="assignment-input select">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {allClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.className}>
                    {cls.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Last Date</Label>
            <Input
              className="assignment-input"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full cursor-pointer">
            Submit Assignment
          </Button>
        </form>

        {teacher && (
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Logged in as: <b>{teacher.name}</b> ({teacher.email})
          </p>
        )}
      </CardContent>
    </Card>
  );
}
