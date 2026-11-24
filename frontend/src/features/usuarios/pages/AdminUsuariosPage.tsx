import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type { Usuario } from "@/features/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { formatearFecha } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useUsuarioMutations, useUsuarios } from "../hooks/useUsuarios";

const columnHelper = createColumnHelper<Usuario>();
const sinUsuarios: Usuario[] = [];

export function AdminUsuariosPage() {
  const { data: usuarios, isPending, error, refetch } = useUsuarios();
  const { activar, desactivar } = useUsuarioMutations();
  const miId = useAuthStore((state) => state.usuario?.id);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [busqueda, setBusqueda] = useState("");

  const { mutate: activarUno } = activar;
  const { mutate: desactivarUno } = desactivar;
  // Mientras una mutacion corre se deshabilita el boton de esa fila
  const enCurso = activar.isPending ? activar.variables?.id : desactivar.isPending ? desactivar.variables?.id : undefined;

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Usuario",
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("full_name", { header: "Nombre" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) =>
          info.getValue() === "admin" ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">admin</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">user</span>
          ),
      }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        enableGlobalFilter: false,
        cell: (info) =>
          info.getValue() ? (
            <span className="font-semibold text-error">Desactivado</span>
          ) : (
            <span className="font-semibold text-success">Activo</span>
          ),
      }),
      columnHelper.accessor("created_at", {
        header: "Alta",
        enableGlobalFilter: false,
        cell: (info) => formatearFecha(info.getValue()),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const usuario = row.original;
          // El backend no deja desactivar la cuenta propia: el boton ni se muestra
          if (usuario.id === miId) return <span className="text-xs text-gray-400">Tu cuenta</span>;
          return usuario.disabled ? (
            <Button variant="outline" size="sm" disabled={enCurso === usuario.id} onClick={() => activarUno(usuario)}>
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              disabled={enCurso === usuario.id}
              onClick={() => {
                if (window.confirm(`¿Desactivar a ${usuario.username}? No va a poder iniciar sesión.`)) {
                  desactivarUno(usuario);
                }
              }}
            >
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [miId, enCurso, activarUno, desactivarUno]
  );

  const table = useReactTable({
    data: usuarios ?? sinUsuarios,
    columns,
    state: { sorting, globalFilter: busqueda },
    onSortingChange: setSorting,
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-gray-500">
          Un usuario desactivado no puede iniciar sesión ni usar la sesión que tenía abierta.
        </p>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los usuarios" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : (
        <DataTable table={table} conBusqueda />
      )}
    </section>
  );
}
