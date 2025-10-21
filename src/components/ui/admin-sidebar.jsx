"use client";

import { memo, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebaseconfig";

// ✅ Firebase imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ✅ Shadcn UI Sidebar Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// ✅ Lucide Icons
import { LayoutDashboard, Users, FileText, User } from "lucide-react";

export const AdminSidebar = memo(() => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState("");
  const [links, setLinks] = useState([]);

  // ✅ Role-based navigation links
  const navLinks = {
    admin: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { name: "Time Table", path: "/timetable", icon: FileText },
      { name: "Create Class", path: "/createclass", icon: Users },
      { name: "Create User", path: "/signup", icon: User },
      { name: "Attendance", path: "/attendance", icon: FileText },
      { name: "Assignments", path: "/uploadassignment", icon: Users },
       { name: "Result", path: "/result", icon: FileText },
      { name: "Fee", path: "/fee", icon: Users },
      { name: "Assignments", path: "/assignment", icon: FileText },
      { name: "Attendance", path: "/student-attend", icon: Users },
      { name: "Application", path: "/application", icon: FileText },
    ],
    teacher: [
      { name: "Attendance", path: "/attendance", icon: FileText },
      { name: "Assignments", path: "/uploadassignment", icon: Users },
      
    ],
    student: [
      { name: "Result", path: "/result", icon: FileText },
      { name: "Fee", path: "/fee", icon: Users },
      { name: "Assignments", path: "/assignment", icon: FileText },
      { name: "Attendance", path: "/attendance", icon: Users },
      { name: "Application", path: "/application", icon: FileText },
    ],
  };

  // ✅ Fetch user role from Firestore
  useEffect(() => {
    const fetchUserRole = async (uid) => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setRole(userData.role);
          setLinks(navLinks[userData.role] || []);
        } else {
          console.warn("No such user found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchUserRole(user.uid);
      else {
        setRole("");
        setLinks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setRole("");
      setLinks([]);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      {/* ✅ Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link prefetch={false} href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LMS Portal</span>
                  <span className="truncate text-xs">
                    {role ? `${role.toUpperCase()} Panel` : "Loading..."}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ✅ Dynamic Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role ? "Navigation" : "Loading..."}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link prefetch={false} href={item.path}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ✅ Footer */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Sign Out Button */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              Sign Out
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Profile Link */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";
