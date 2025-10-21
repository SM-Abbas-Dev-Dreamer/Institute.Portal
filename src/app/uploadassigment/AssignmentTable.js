"use client";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseconfig";
import "./AssignmentPage.css"
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";

export default function AssignmentTable({ teacher }) {
  const [assignments, setAssignments] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    className: true,
    totalMarks: true,
    remainingTime: true,
  });

  useEffect(() => {
    if (!teacher) return;
    const q = query(
      collection(db, "assignments"),
      where("teacherEmail", "==", teacher.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(data);
    });
    return () => unsubscribe();
  }, [teacher]);

  const getCountdown = (deadline) => {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;
    if (diff <= 0) return "Time Over";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Card className="shadow-md bg-amber-none w-full md:w-[min(600px,100%)] m-auto ">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Your Created Assignments
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="bg-transparent table-filter " >
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(visibleColumns).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visibleColumns[key]}
                onCheckedChange={() =>
                  setVisibleColumns((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No assignments created yet.
          </p>
        ) : (
          <Table  >
            <TableCaption>All your created assignments</TableCaption>
            <TableHeader>
              <TableRow>
                {visibleColumns.title && <TableHead>Title</TableHead>}
                {visibleColumns.className && <TableHead>Class</TableHead>}
                {visibleColumns.totalMarks && <TableHead>Total Marks</TableHead>}
                {visibleColumns.remainingTime && <TableHead>Remaining Time</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  {visibleColumns.title && <TableCell>{a.title}</TableCell>}
                  {visibleColumns.className && <TableCell>{a.className}</TableCell>}
                  {visibleColumns.totalMarks && <TableCell>{a.totalMarks}</TableCell>}
                  {visibleColumns.remainingTime && (
                    <TableCell className="font-medium text-green-600">
                      {getCountdown(a.deadline)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
