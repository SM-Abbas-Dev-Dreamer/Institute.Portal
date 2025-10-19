import React from "react";
import AppSidebarLayout from "@/components/AppSidebar";

export default function Home() {
  return (
    <AppSidebarLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome to Home Page</h1>
      <p className="text-gray-700">
        Yeh tumhara main content area hai. Sidebar left me fix hai.
      </p>
    </AppSidebarLayout>
  );
}
