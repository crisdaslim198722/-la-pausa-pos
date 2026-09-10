"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, PackagePlus, Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Insumo {
  id: string;
  nombre: string;
  unidadCompra: string;
  precioCompra: number | any;
  rendimientoUnidad: number | any;
  unidadMedida: string;
  costoUnitario: number | any;
  cantidadDisponible?: number | any;
}

interface Props {
  insumos: Insumo[];
}

export function InsumoTable({ insumos }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"A-Z" | "Z-A" | "COST_DESC" | "COST_ASC">("A-Z");

  const filteredAndSorted = insumos
    .filter((insumo) =>
      insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.nombre.localeCompare(b.nombre);
      if (sortOrder === "Z-A") return b.nombre.localeCompare(a.nombre);
      
      const costA = Number(a.costoUnitario);
      const costB = Number(b.costoUnitario);
      if (sortOrder === "COST_DESC") return costB - costA;
      if (sortOrder === "COST_ASC") return costA - costB;
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#B49659]/30 overflow-hidden">
      {/* Barra de Herramientas */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F4EEE2]/30">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar insumo..."
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
            href="/inventario/insumos/crear"
            className="bg-[#A13E21] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-[#A13E21]/90 whitespace-nowrap transition"
          >
            + Crear Insumo
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron insumos.
            <div className="mt-4">
              <Link href="/inventario/insumos/crear" className="text-[#A13E21] underline hover:text-[#A13E21]/80">
                Crear el primer insumo
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#B8CCC5]/20 text-[#6E6C41] border-b border-gray-200">
                <th className="p-3 font-semibold text-sm">Nombre</th>
                <th className="p-3 font-semibold text-sm hidden sm:table-cell">Unidad Compra</th>
                <th className="p-3 font-semibold text-sm">Precio</th>
                <th className="p-3 font-semibold text-sm hidden md:table-cell">Rendimiento</th>
                <th className="p-3 font-semibold text-sm hidden sm:table-cell">Medida</th>
                <th className="p-3 font-semibold text-sm">Costo Unitario</th>
                <th className="p-3 font-semibold text-sm text-right">Stock Actual</th>
                <th className="p-3 font-semibold text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((insumo) => (
                <tr key={insumo.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3 text-[#6E6C41] font-medium capitalize">{insumo.nombre}</td>
                  <td className="p-3 text-gray-600 hidden sm:table-cell capitalize">{insumo.unidadCompra}</td>
                  <td className="p-3 text-gray-600 font-medium">{formatCurrency(Number(insumo.precioCompra))}</td>
                  <td className="p-3 text-gray-600 hidden md:table-cell">{Number(insumo.rendimientoUnidad)}</td>
                  <td className="p-3 text-gray-600 hidden sm:table-cell capitalize">{insumo.unidadMedida}</td>
                  <td className="p-3 text-[#A13E21] font-semibold">{formatCurrency(Number(insumo.costoUnitario))}</td>
                  <td className="p-3 text-right font-black text-gray-800">
                    <span className={`px-2 py-1 rounded-md text-xs ${Number(insumo.cantidadDisponible) <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {Number(insumo.cantidadDisponible || 0)} <span className="uppercase">{insumo.unidadMedida}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/inventario/insumos/${insumo.id}/editar`}
                      className="inline-flex items-center justify-center p-2 text-[#B49659] hover:bg-[#B49659]/10 rounded transition"
                      title="Editar insumo"
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
