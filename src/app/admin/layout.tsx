
import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f3]">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
