import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/navbar.js";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS Portal",
  description: "A Role-Based Dashboard using Shadcn + Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>

        <DashboardHeader/>
        {children} {/* 👈 yahan har new page ka content render hoga */}
      </SidebarInset>
    </SidebarProvider>
      </body>
    </html>
  );
}


