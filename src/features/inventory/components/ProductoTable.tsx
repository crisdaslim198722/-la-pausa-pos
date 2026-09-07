"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Search, Coffee } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  costoTotal: number;
  _count: { receta: number };
}

interface Props {
  productos: Producto[];
}

export function ProductoTable({ productos }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"A-Z" | "Z-A" | "COST_DESC" | "COST_ASC">("A-Z");

  const filteredAndSorted = productos
    .filter((p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.nombre.localeCompare(b.nombre);
      if (sortOrder === "Z-A") return b.nombre.localeCompare(a.nombre);
      if (sortOrder === "COST_DESC") return b.costoTotal - a.costoTotal;
      if (sortOrder === "COST_ASC") return a.costoTotal - b.costoTotal;
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#B49659]/30 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F4EEE2]/30">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none text-sm"
          />
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto items-center">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-[#A13E21] text-sm bg-white"
          >
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
            <option value="COST_DESC">Costo: Mayor a Menor</option>
            <option value="COST_ASC">Costo: Menor a Mayor</option>
          </select>
          
          <Link
            href="/productos/crear"
            className="bg-[#A13E21] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-[#A13E21]/90 whitespace-nowrap transition"
          >
            + Crear Producto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center text-gray-500">
            <Coffee className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-600">No se encontraron productos</p>
            <p className="text-sm mt-1 mb-6">Comienza armando tu primer producto usando los insumos del inventario.</p>
            <Link href="/productos/crear" className="text-[#A13E21] font-semibold underline hover:text-[#A13E21]/80">
              Crear Producto
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#B8CCC5]/20 text-[#6E6C41] border-b border-gray-200">
                <th className="p-3 font-semibold text-sm">Nombre del Producto</th>
                <th className="p-3 font-semibold text-sm">Receta</th>
                <th className="p-3 font-semibold text-sm">Costo Total</th>
                <th className="p-3 font-semibold text-sm text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((producto) => (
                <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3 text-[#6E6C41] font-bold capitalize">{producto.nombre}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F4EEE2] text-[#6E6C41] border border-[#B49659]/30">
                      {producto._count.receta} insumos
                    </span>
                  </td>
                  <td className="p-3 text-[#A13E21] font-bold">${Number(producto.costoTotal).toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/productos/${producto.id}/editar`}
                      className="inline-flex items-center justify-center p-2 text-[#B49659] hover:bg-[#B49659]/10 rounded transition"
                      title="Editar receta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
