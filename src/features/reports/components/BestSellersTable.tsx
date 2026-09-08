"use client";

import { Award } from "lucide-react";

interface BestSeller {
  nombre: string;
  cantidadVendida: number;
  ingresoGenerado: number;
}

export function BestSellersTable({ productos }: { productos: BestSeller[] }) {
  if (productos.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#B49659]/30 overflow-hidden">
      <div className="bg-[#F4EEE2] p-4 border-b border-[#B49659]/20 flex items-center gap-2">
        <Award className="w-5 h-5 text-[#A13E21]" />
        <h3 className="font-bold text-[#6E6C41]">Top Productos (Más Vendidos)</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">#</th>
              <th className="p-4 font-bold">Producto</th>
              <th className="p-4 font-bold text-center">Unidades</th>
              <th className="p-4 font-bold text-right">Ingresos Generados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition">
                <td className="p-4 text-gray-400 font-bold">{idx + 1}</td>
                <td className="p-4 font-bold text-gray-800 capitalize">{p.nombre}</td>
                <td className="p-4 text-center">
                  <span className="bg-[#F4EEE2] text-[#A13E21] px-2 py-1 rounded-lg font-black text-sm">
                    {p.cantidadVendida}
                  </span>
                </td>
                <td className="p-4 text-right font-black text-green-700">
                  ${p.ingresoGenerado.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
