import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { obtenerUsuarioActual } from "@/lib/auth/dal";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await obtenerUsuarioActual();

  return (
    <div className="flex min-h-screen bg-[#f5f5f3]">
      <Sidebar nombre={usuario.nombre} rol={usuario.rol} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}