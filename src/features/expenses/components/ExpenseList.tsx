"use client";

import { PackageSearch, Receipt, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Gasto {
  id: string;
  tipo: "COMPRA_INSUMO" | "OPERATIVO";
  descripcion: string;
  montoTotal: number;
  fechaHora: string;
  insumoNombre: string | null;
  unidadCompra: string | null;
  cantidadComprada: number | null;
}

export function ExpenseList({ gastos }: { gastos: Gasto[] }) {
  if (gastos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
        No hay salidas de dinero registradas.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Tipo</th>
              <th className="p-4 font-bold">Descripción</th>
              <th className="p-4 font-bold">Fecha</th>
              <th className="p-4 font-bold text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gastos.map((gasto) => (
              <tr key={gasto.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4">
                  {gasto.tipo === "COMPRA_INSUMO" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f0eb] text-[#3e664f]">
                      <PackageSearch className="w-3 h-3" /> Insumo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F4EEE2] text-[#A13E21]">
                      <Receipt className="w-3 h-3" /> Operativo
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{gasto.descripcion}</p>
                  {gasto.tipo === "COMPRA_INSUMO" && gasto.cantidadComprada && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ingresado: <span className="font-bold text-gray-700">{gasto.cantidadComprada} {gasto.unidadCompra}</span>
                    </p>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(gasto.fechaHora).toLocaleDateString()} {new Date(gasto.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 text-right font-black text-gray-800">
                  {formatCurrency(gasto.montoTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
