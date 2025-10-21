"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const monthData = [
  { month: "January", Mathematics: 80, Physics: 75, "Computer Science": 90, English: 70, Islamiat: 85 },
  { month: "February", Mathematics: 85, Physics: 78, "Computer Science": 88, English: 76, Islamiat: 87 },
  { month: "March", Mathematics: 78, Physics: 80, "Computer Science": 92, English: 72, Islamiat: 90 },
  { month: "April", Mathematics: 90, Physics: 82, "Computer Science": 95, English: 80, Islamiat: 92 },
  { month: "May", Mathematics: 82, Physics: 84, "Computer Science": 91, English: 77, Islamiat: 89 },
  { month: "June", Mathematics: 87, Physics: 79, "Computer Science": 94, English: 75, Islamiat: 91 },
];

const subjectAttendance = [
  { subject: "Mathematics", attendance: "88%", totalClasses: 25, attended: 22 },
  { subject: "Physics", attendance: "82%", totalClasses: 22, attended: 18 },
  { subject: "Computer Science", attendance: "95%", totalClasses: 20, attended: 19 },
  { subject: "English", attendance: "78%", totalClasses: 18, attended: 14 },
  { subject: "Islamiat", attendance: "92%", totalClasses: 15, attended: 14 },
];

const subjectColors = {
  Mathematics: "#2563eb",
  Physics: "#f59e0b",
  "Computer Science": "#10b981",
  English: "#ef4444",
  Islamiat: "#8b5cf6",
};

export default function StudentAttend() {
  const [view, setView] = useState("month");
  const [selectedSubjects, setSelectedSubjects] = useState([
    "Mathematics",
    "Physics",
    "Computer Science",
    "English",
    "Islamiat",
  ]);

  // ✅ Calculate overall attendance percentage
  const totalLectures = subjectAttendance.reduce((acc, s) => acc + s.totalClasses, 0);
  const totalAttended = subjectAttendance.reduce((acc, s) => acc + s.attended, 0);
  const overallPercentage = ((totalAttended / totalLectures) * 100).toFixed(1);

  // ✅ Create data with overall average per month
  const overallMonthData = monthData.map((m) => {
    const avg =
      (m.Mathematics + m.Physics + m["Computer Science"] + m.English + m.Islamiat) / 5;
    return { ...m, Overall: avg };
  });

  const handleToggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              View your attendance record — Month-wise, Subject-wise, or Overall
            </CardDescription>
          </div>

          <div className="flex gap-2 mt-3 sm:mt-0">
            <button
              className={`px-3 py-1 rounded-lg border cursor-pointer ${
                view === "month" ? "bg-gray-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("month")}
            >
              Month Wise
            </button>
            <button
              className={`px-3 py-1 rounded-lg border cursor-pointer ${
                view === "subject" ? "bg-gray-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("subject")}
            >
              Subject Wise
            </button>
            <button
              className={`px-3 py-1 rounded-lg border cursor-pointer ${
                view === "overall" ? "bg-gray-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("overall")}
            >
              Overall
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {view === "subject" && (
            <div className="mb-4 flex flex-wrap gap-3">
              {Object.keys(subjectColors).map((subject) => (
                <label
                  key={subject}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border cursor-pointer shadow-sm"
                >
                  <Checkbox
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={() => handleToggleSubject(subject)}
                  />
                  <span className="font-medium">{subject}</span>
                </label>
              ))}
            </div>
          )}

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ReTooltip />
                {view === "subject" &&
                  selectedSubjects.map((subject) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      stroke={subjectColors[subject]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                {view === "month" && (
                  <Line
                    type="monotone"
                    dataKey="Mathematics"
                    stroke="#2563eb"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                )}
                {view === "overall" && (
                  <Line
                    type="monotone"
                    dataKey="Overall"
                    stroke="#111827"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
          </div>
          <div className="text-muted-foreground leading-none">
            Showing {view === "month"
              ? "monthly"
              : view === "overall"
              ? "overall"
              : "subject-wise"} attendance trends
          </div>
        </CardFooter>
      </Card>

      {/* ✅ Subject Attendance Table + Overall Summary */}
      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Subject Wise Attendance</CardTitle>
          <CardDescription>Detailed breakdown of each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="text-left py-2 px-3">Subject</th>
                <th className="text-left py-2 px-3">Total Classes</th>
                <th className="text-left py-2 px-3">Attended</th>
                <th className="text-left py-2 px-3">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {subjectAttendance
                .filter((s) => selectedSubjects.includes(s.subject))
                .map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-100">
                    <td className="py-2 px-3 font-medium">{s.subject}</td>
                    <td className="py-2 px-3">{s.totalClasses}</td>
                    <td className="py-2 px-3">{s.attended}</td>
                    <td className="py-2 px-3">{s.attendance}</td>
                  </tr>
                ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="py-2 px-3">Overall</td>
                <td className="py-2 px-3">{totalLectures}</td>
                <td className="py-2 px-3">{totalAttended}</td>
                <td className="py-2 px-3">{overallPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
