export const dynamic = "force-dynamic";

import { getSalesMix } from "@/features/reports/actions/get-sales-mix";
import { DateRangeFilter } from "@/features/reports/components/DateRangeFilter";
import { SalesMixTable } from "@/features/reports/components/SalesMixTable";
import { ArrowLeft, Percent, PieChart, Star } from "lucide-react";
import Link from "next/link";

export default async function SalesMixPage({
  searchParams
}: {
  searchParams: { start?: string; end?: string }
}) {
  const { start, end } = await searchParams;
  const { data, error } = await getSalesMix(start, end);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 p-2 px-4 text-gray-500 hover:text-[#A13E21] hover:bg-[#F4EEE2] rounded-full transition font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" /> Inicio
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#A13E21]">Mix de Ventas</h1>
          <p className="text-[#6E6C41] mt-1 font-medium">Margen ponderado y participación del menú.</p>
        </div>
      </div>

      <DateRangeFilter />

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F4EEE2] text-[#A13E21] flex items-center justify-center shrink-0">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Ventas Totales</p>
                <p className="text-2xl font-black text-gray-800">
                  ${data.ventasTotalesPeriodo.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-[#3e664f] text-white rounded-2xl shadow-sm p-6 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Percent className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-green-100 uppercase">Margen Global Ponderado</p>
                <p className="text-4xl font-black text-white">
                  {data.margenGlobalPonderado.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e8f0eb] text-[#3e664f] flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Producto Estrella</p>
                <p className="text-lg font-black text-gray-800 leading-tight">
                  {data.items.length > 0 ? data.items[0].nombre : "N/A"}
                </p>
                {data.items.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Aporta un {data.items[0].aporteGlobal.toFixed(1)}% al margen total
                  </p>
                )}
              </div>
            </div>
          </div>

          <SalesMixTable items={data.items} />
        </div>
      ) : null}
    </div>
  );
}
