export const dynamic = "force-dynamic";

import { getFinancialMetrics } from "@/features/reports/actions/get-closure";
import { DateRangeFilter } from "@/features/reports/components/DateRangeFilter";
import { MetricsCards } from "@/features/reports/components/MetricsCards";
import { BestSellersTable } from "@/features/reports/components/BestSellersTable";
import { CashFlowSection } from "@/features/reports/components/CashFlowSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReportesPage({
  searchParams
}: {
  searchParams: { start?: string; end?: string }
}) {
  const { start, end } = await searchParams;
  
  const { data, error } = await getFinancialMetrics(start, end);

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
          <h1 className="text-3xl font-black text-[#A13E21]">Reportes y Cierres</h1>
          <p className="text-[#6E6C41] mt-1 font-medium">Analiza la rentabilidad y rendimiento de tu negocio.</p>
        </div>
      </div>

      <DateRangeFilter />

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : data ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* SECCIÓN 1: Rentabilidad de los Productos */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-800">Rentabilidad de Ventas (El Menú)</h2>
              <p className="text-sm text-gray-500">Desempeño puramente comercial: Ventas cobradas menos el costo exacto de los ingredientes usados.</p>
            </div>
            <MetricsCards metrics={data} />
          </section>
          
          {/* SECCIÓN 2: Flujo de Caja */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-800">Salud Financiera (El Bolsillo)</h2>
              <p className="text-sm text-gray-500">Movimiento real de dinero: Todo lo que entró a la caja menos todo lo que salió (Gastos + Abastecimiento).</p>
            </div>
            <CashFlowSection metrics={data} />
          </section>
          
          {/* SECCIÓN 3: Volumen y Tops */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-800">Volumen y Productos Estrella</h2>
              <p className="text-sm text-gray-500">Estadísticas de lo más vendido y transacciones totales.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BestSellersTable productos={data.bestSellers} />
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-2xl">🧾</span>
                </div>
                <h3 className="font-bold text-gray-700">Órdenes Pagadas</h3>
                <p className="text-5xl font-black text-[#A13E21] mt-2">{data.ordenesPagadas}</p>
                <p className="text-sm text-gray-500 mt-2">En el periodo seleccionado</p>
              </div>
            </div>
          </section>

        </div>
      ) : null}
    </div>
  );
}
