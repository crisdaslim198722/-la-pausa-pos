"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Search, DollarSign, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ProductoPrecio {
  id: string;
  nombre: string;
  costoTotal: number;
  precioVentaActual: number;
}

interface Props {
  productos: ProductoPrecio[];
}

export function PricingListTable({ productos }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"A-Z" | "COSTO" | "PRECIO" | "MARGEN">("A-Z");

  const computedProducts = productos.map(p => {
    const margenAbsoluto = p.precioVentaActual > 0 ? p.precioVentaActual - p.costoTotal : 0;
    const margenRelativo = p.precioVentaActual > 0 ? (margenAbsoluto / p.precioVentaActual) * 100 : 0;
    return { ...p, margenAbsoluto, margenRelativo };
  });

  const filteredAndSorted = computedProducts
    .filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.nombre.localeCompare(b.nombre);
      if (sortOrder === "COSTO") return b.costoTotal - a.costoTotal;
      if (sortOrder === "PRECIO") return b.precioVentaActual - a.precioVentaActual;
      if (sortOrder === "MARGEN") return b.margenRelativo - a.margenRelativo;
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
            <option value="PRECIO">Mayor Precio Venta</option>
            <option value="MARGEN">Mayor Margen (%)</option>
            <option value="COSTO">Mayor Costo Producción</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#B8CCC5]/20 text-[#6E6C41] border-b border-gray-200">
                <th className="p-3 font-semibold text-sm">Producto</th>
                <th className="p-3 font-semibold text-sm">Costo Producción</th>
                <th className="p-3 font-semibold text-sm">Precio Venta</th>
                <th className="p-3 font-semibold text-sm">Margen ($)</th>
                <th className="p-3 font-semibold text-sm">Margen (%)</th>
                <th className="p-3 font-semibold text-sm text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((producto) => {
                const isSinPrecio = producto.precioVentaActual === 0;
                const isMargenNegativo = !isSinPrecio && producto.margenAbsoluto < 0;

                return (
                  <tr 
                    key={producto.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${isMargenNegativo ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="p-3 text-[#6E6C41] font-bold capitalize">{producto.nombre}</td>
                    <td className="p-3 text-gray-600 font-medium">{formatCurrency(producto.costoTotal)}</td>
                    <td className="p-3">
                      {isSinPrecio ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800">
                          Sin Precio
                        </span>
                      ) : (
                        <span className="font-bold text-[#A13E21] text-lg">
                          {formatCurrency(producto.precioVentaActual)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {!isSinPrecio && (
                        <span className={`font-medium ${isMargenNegativo ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(producto.margenAbsoluto)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {!isSinPrecio && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          isMargenNegativo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {producto.margenRelativo.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isSinPrecio ? (
                        <Link
                          href={`/inventario/precios/crear/${producto.id}`}
                          className="inline-flex items-center gap-1 text-xs bg-[#B49659] text-white px-3 py-1.5 rounded font-semibold hover:bg-[#B49659]/90 transition"
                        >
                          <DollarSign className="w-3 h-3" /> Asignar
                        </Link>
                      ) : (
                        <Link
                          href={`/inventario/precios/editar/${producto.id}`}
                          className="inline-flex items-center justify-center p-2 text-[#A13E21] bg-white border border-[#A13E21]/20 hover:bg-[#A13E21]/5 rounded transition"
                          title="Editar precio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
