"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebaseconfig";
import { Separator } from "@/components/ui/separator";
import AssignmentForm from "./AssignmentForm";
import AssignmentTable from "./AssignmentTable";

export default function AssignmentPage() {
  const [teacher, setTeacher] = useState(null);

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

  return (
    <div className="p-6 space-y-10">
      <AssignmentForm />
      <Separator className="my-10" />
      <AssignmentTable teacher={teacher} />
    </div>
  );
}
