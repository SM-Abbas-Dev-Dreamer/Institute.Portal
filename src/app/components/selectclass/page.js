"use client";
import { useEffect, useState } from "react";
import { db } from "../../../../firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClassSelect({
  selectedClass,
  setSelectedClass,
  triggerClass = "",   // 🔹 Page-specific class for trigger
  contentClass = "",   // 🔹 Page-specific class for dropdown content
  itemClass = "",      // 🔹 Page-specific class for each item
  placeholder = "Select a Class",
}) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(data);
    });

    return () => unsub();
  }, []);

  return (
    <Select value={selectedClass || ""} onValueChange={setSelectedClass}>
      <SelectTrigger className={`class-select-trigger ${triggerClass}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className={`class-select-content ${contentClass}`}>
        {classes.length > 0 ? (
          classes.map((cls) => (
            <SelectItem
              key={cls.id}
              value={String(cls.id)}
              className={`${itemClass}`}
            >
              {cls.className}
            </SelectItem>
          ))
        ) : (
          <div className="no-classes">No Classes Available</div>
        )}
      </SelectContent>
    </Select>
  );
}
