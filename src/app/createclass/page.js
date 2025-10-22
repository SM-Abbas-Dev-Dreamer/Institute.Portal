"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { db } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";

import { Button } from "../../components/ui/button";
import "./CreateClassPage.css";

export default function CreateClassPage() {
  const [classes, setClasses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([
    "className",
    "subjects",
    "actions",
  ]);

  // ✅ React Hook Form setup
  const { register, handleSubmit, control, reset, setValue } = useForm({
    defaultValues: {
      className: "",
      subjectInput: "",
      subjects: [],
    },
  });

  // ✅ Subjects array (Todo style)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subjects",
  });

  // 🔹 Real-time Firestore fetch
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

  // 🔹 Add subject todo-style
  const handleAddSubject = (subjectInput) => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return alert("Please enter a subject");
    const existing = fields.map((f) => f.name.toLowerCase());
    if (existing.includes(trimmed.toLowerCase())) {
      alert("Subject already added!");
      return;
    }
    append({ name: trimmed });
    setValue("subjectInput", "");
  };

  // 🔹 Submit handler
  const onSubmit = async (data) => {
    const className = data.className.trim();
    const subjects = data.subjects.map((s) => s.name);

    if (!className) return alert("Please enter a class name");

    try {
      if (editMode) {
        const ref = doc(db, "classes", editId);
        await updateDoc(ref, { className, subjects });
        alert("Class updated successfully!");
        setEditMode(false);
        setEditId(null);
      } else {
        await addDoc(collection(db, "classes"), {
          className,
          subjects,
          createdAt: new Date().toISOString(),
        });
        alert("Class created successfully!");
      }

      reset({ className: "", subjectInput: "", subjects: [] });
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  // 🔹 Edit
  const handleEdit = (cls) => {
    setEditMode(true);
    setEditId(cls.id);
    reset({
      className: cls.className,
      subjectInput: "",
      subjects: cls.subjects?.map((name) => ({ name })) || [],
    });
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      await deleteDoc(doc(db, "classes", id));
      alert("Class deleted successfully!");
    }
  };

  // 🔹 Column toggle
  const handleColumnToggle = (value) => {
    setVisibleColumns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  return (
    <>
      <h1 className="createclass">
        {editMode ? "Edit Class" : "Create New Class"}
      </h1>

      <div className="create-class-page">
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="class-input-section">
              {/* 🔹 Class Name Input */}
              <div className="input-box">
                <input type="text" {...register("className")} required />
                <label>
                  {editMode ? "Edit Class Name" : "Enter Class Name"}
                </label>
              </div>
              <Button type="submit" className="w-full mt-3">
                {editMode ? "Update Class" : "Add Class"}
              </Button>
            </div>

            {/* 🔹 Subject Input (Todo style) */}
            <div className="subject-section">
              <div className="subject-input-btn">

              <div className="subject input-box">
                <input
                  type="text"
                  {...register("subjectInput")}
                  placeholder="Enter Subject"
                  />
              </div>
              <Button
                type="button"
                onClick={() =>
                  handleAddSubject(
                    document.querySelector("[name='subjectInput']").value
                  )
                }
                >
                Add Subject
              </Button>
                </div>

              {/* 🔹 Show Added Subjects */}
              {fields.length > 0 && (
                  <ul className="subject-list">
                    {fields.map((item, index) => (
                      <li key={item.id}>
                        {item.name}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => remove(index)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
              )}
            </div>
          </form>
        </div>

        {/* 🔹 Column Toggle Select */}
        <div className="column-toggle mt-5 ">
          <Select onValueChange={handleColumnToggle}>
            <SelectTrigger className="w-[200px] filter">
              <SelectValue placeholder="Select Column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="className">Class Name</SelectItem>
              <SelectItem value="subjects">Subjects</SelectItem>
              <SelectItem value="actions">Actions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🔹 Table */}
        <div className="class-list mt-4">
          <h2></h2>
          {classes.length === 0 ? (
            // <Loading2/>
            <p>Hello</p>
          ) : (
            <Table className="mt-3 border rounded-lg">
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("className") && (
                    <TableHead>Class Name</TableHead>
                  )}
                  {visibleColumns.includes("subjects") && (
                    <TableHead>Subjects</TableHead>
                  )}
                  {visibleColumns.includes("actions") && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    {visibleColumns.includes("className") && (
                      <TableCell>{cls.className}</TableCell>
                    )}
                    {visibleColumns.includes("subjects") && (
                      <TableCell>
                        {cls.subjects?.length
                          ? cls.subjects.join(", ")
                          : "No subjects added"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("actions") && (
                      <TableCell>
                        <div className="flex gap-2 class-edit-delete ">
                          <Button
                            variant="outline"
                            onClick={() => handleEdit(cls)}
                          >
                            <i class="fa-solid fa-pencil"></i>
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(cls.id)}
                          >
                            <i class="fa-solid fa-trash"></i>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
