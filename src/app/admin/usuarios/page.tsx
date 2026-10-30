import Link from "next/link";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { fechaLarga } from "@/lib/formato";
import { db } from "@/prisma/db";
import { desbloquearUsuario } from "./acciones";

export default async function UsuariosPage() {
  const yo = await requerirAdministrador();

  const usuarios = await db.orm.public.Usuario.select("id", "nombre", "correo", "rol", "activo", "bloqueadoHasta", "ultimoAcceso")
    .orderBy((u) => u.nombre.asc())
    .all();
  const ahora = Date.now();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado
        seccion="Administración"
        titulo="Usuarios"
        descripcion="Personal que entra al panel. Cada persona tiene su propio usuario: no se comparten contraseñas."
        accion={{ texto: "+ Nuevo usuario", href: "/admin/usuarios/nuevo" }}
      />

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Correo</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Último acceso</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => {
              const bloqueado = u.bloqueadoHasta !== null && Date.parse(u.bloqueadoHasta) > ahora;
              return (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-bold">
                    {u.nombre} {u.id === yo.id && <span className="text-xs font-normal text-gray-500">(vos)</span>}
                  </td>
                  <td className="px-5 py-3">{u.correo}</td>
                  <td className="px-5 py-3 capitalize">{u.rol}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        bloqueado ? "bg-red-50 text-red-700" : u.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bloqueado ? "Bloqueado" : u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.ultimoAcceso ? fechaLarga(u.ultimoAcceso) : "Nunca"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-4 font-bold">
                      {bloqueado && (
                        <form action={desbloquearUsuario.bind(null, u.id)}>
                          <button type="submit" className="text-green-700">
                            Desbloquear
                          </button>
                        </form>
                      )}
                      <Link href={`/admin/usuarios/${u.id}`} className="underline decoration-yellow-400 decoration-2 underline-offset-4">
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}