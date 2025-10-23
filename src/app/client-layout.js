
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { DashboardHeader } from "../components/ui/dashboard-header";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const noSidebarRoutes = ["/login", "/forgot-password"];
  const hideSidebar = noSidebarRoutes.includes(pathname);

  return hideSidebar ? (
    <>{children}</>
  ) : (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
