import { flexRender, type Table } from "@tanstack/react-table";
import { Paginacion } from "./Paginacion";

interface DataTableProps<TData> {
  // La pagina crea la tabla con useReactTable; aca solo se dibuja
  table: Table<TData>;
  // Muestra el buscador del filtro global (paginacion del lado del cliente)
  conBusqueda?: boolean;
  mensajeSinFilas?: string;
}

const flechas = { asc: " ▲", desc: " ▼" };

export function DataTable<TData>({
  table,
  conBusqueda = false,
  mensajeSinFilas = "Ningún resultado coincide con la búsqueda.",
}: DataTableProps<TData>) {
  const filas = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-3">
      {conBusqueda && (
        <input
          type="search"
          aria-label="Buscar en la tabla"
          placeholder="Buscar..."
          value={(table.getState().globalFilter as string | undefined) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="input sm:max-w-xs"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={orden === "asc" ? "ascending" : orden === "desc" ? "descending" : undefined}
                      className="px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="uppercase hover:text-gray-900"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {orden ? flechas[orden] : null}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-8 text-center text-gray-500">
                  {mensajeSinFilas}
                </td>
              </tr>
            ) : (
              filas.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={table.getState().pagination.pageIndex}
        totalPaginas={table.getPageCount()}
        onCambiar={table.setPageIndex}
        total={table.getRowCount()}
      />
    </div>
  );
}
