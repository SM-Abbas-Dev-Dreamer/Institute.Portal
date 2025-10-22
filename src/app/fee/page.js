"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip as ReTooltip,
} from "recharts";

const feeData = [
  { month: "January", paid: 5000 },
  { month: "February", paid: 5000 },
  { month: "March", paid: 3000 },
  { month: "April", paid: 0 },
  { month: "May", paid: 2000 },
  { month: "June", paid: 5000 },
  { month: "July", paid: 0 },
  { month: "August", paid: 4000 },
  { month: "September", paid: 4500 },
  { month: "October", paid: 5000 },
];

const FeeStatusPage = () => {
  const totalFee = 50000;
  const paidFee = feeData.reduce((sum, item) => sum + item.paid, 0);
  const remainingFee = totalFee - paidFee;

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <Card className="max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">💰 Student Fee Status</CardTitle>
          <CardDescription>Overview of your fee payments</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 border rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Total Fee</p>
              <p className="text-xl font-semibold text-blue-600">Rs. {totalFee}</p>
            </div>
            <div className="p-3 border rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Paid Fee</p>
              <p className="text-xl font-semibold text-green-600">Rs. {paidFee}</p>
            </div>
            <div className="p-3 border rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Remaining Fee</p>
              <p className="text-xl font-semibold text-red-600">Rs. {remainingFee}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader>
          <CardTitle>📊 Monthly Fee Payment Chart</CardTitle>
          <CardDescription>Shows payment done each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ReTooltip />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="#16a34a"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <div className="flex items-center justify-center gap-2 text-sm py-2">
          Trending up this month <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
      </Card>
    </div>
  );
};

export default FeeStatusPage;
