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

const monthData = [
  { month: "January", attendance: 80 },
  { month: "February", attendance: 85 },
  { month: "March", attendance: 78 },
  { month: "April", attendance: 90 },
  { month: "May", attendance: 82 },
  { month: "June", attendance: 87 },
  { month: "July", attendance: 76 },
  { month: "August", attendance: 88 },
  { month: "September", attendance: 92 },
  { month: "October", attendance: 89 },
  { month: "November", attendance: 85 },
  { month: "December", attendance: 91 },
];

const subjectAttendance = [
  { subject: "Mathematics", attendance: "88%", totalClasses: 25, attended: 22 },
  { subject: "Physics", attendance: "82%", totalClasses: 22, attended: 18 },
  { subject: "Computer Science", attendance: "95%", totalClasses: 20, attended: 19 },
  { subject: "English", attendance: "78%", totalClasses: 18, attended: 14 },
  { subject: "Islamiat", attendance: "92%", totalClasses: 15, attended: 14 },
];

export default function studentAttend() {
  const [view, setView] = useState("month"); // month | week | subject

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>📊 Attendance Overview</CardTitle>
            <CardDescription>
              View your attendance record — Month-wise, Week-wise, or Subject-wise
            </CardDescription>
          </div>

          <div className="flex gap-2 mt-3 sm:mt-0">
            <button
              className={`px-3 py-1 rounded-lg border ${
                view === "month" ? "bg-blue-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("month")}
            >
              Month Wise
            </button>
            <button
              className={`px-3 py-1 rounded-lg border ${
                view === "week" ? "bg-blue-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("week")}
            >
              Week Wise
            </button>
            <button
              className={`px-3 py-1 rounded-lg border ${
                view === "subject" ? "bg-blue-600 text-white" : "bg-white"
              }`}
              onClick={() => setView("subject")}
            >
              Subject Wise
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  view === "month"
                    ? monthData
                    : monthData.slice(0, 4).map((d) => ({ ...d, month: `Week ${Math.ceil(Math.random() * 4)}` }))
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ReTooltip />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#2563eb"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 4.8% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing {view === "month" ? "monthly" : "weekly"} attendance trends
          </div>
        </CardFooter>
      </Card>

      {/* Subject Attendance Table */}
      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>📘 Subject Wise Attendance</CardTitle>
          <CardDescription>Detailed breakdown of each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left py-2 px-3">Subject</th>
                <th className="text-left py-2 px-3">Total Classes</th>
                <th className="text-left py-2 px-3">Attended</th>
                <th className="text-left py-2 px-3">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {subjectAttendance.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-3 font-medium">{s.subject}</td>
                  <td className="py-2 px-3">{s.totalClasses}</td>
                  <td className="py-2 px-3">{s.attended}</td>
                  <td className="py-2 px-3">{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
