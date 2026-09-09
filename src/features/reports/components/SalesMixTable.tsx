"use client";

import { SalesMixItem } from "../actions/get-sales-mix";

export function SalesMixTable({ items }: { items: SalesMixItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
        No hay ventas registradas en este periodo para calcular el mix.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Producto</th>
              <th className="p-4 font-bold text-center">Unidades</th>
              <th className="p-4 font-bold text-right">Ventas Totales</th>
              <th className="p-4 font-bold min-w-[200px]">Participación (Mix %)</th>
              <th className="p-4 font-bold text-center">Margen Producto</th>
              <th className="p-4 font-bold text-right text-[#A13E21]">Aporte Global</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.productoId} className="hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{item.nombre}</p>
                </td>
                <td className="p-4 text-center font-medium text-gray-600">
                  {item.unidadesVendidas}
                </td>
                <td className="p-4 text-right font-medium text-gray-700">
                  ${item.ventasTotales.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-sm font-bold text-gray-700">
                      {item.participacionVentas.toFixed(1)}%
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#3e664f] rounded-full"
                        style={{ width: `${Math.min(item.participacionVentas, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                    item.margenHistoricoPromedio >= 60 ? 'bg-[#e8f0eb] text-[#3e664f]' : 
                    item.margenHistoricoPromedio >= 40 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {item.margenHistoricoPromedio.toFixed(1)}%
                  </span>
                </td>
                <td className="p-4 text-right font-black text-[#A13E21]">
                  {item.aporteGlobal.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
