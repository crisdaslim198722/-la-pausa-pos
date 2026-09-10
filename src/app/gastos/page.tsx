export const dynamic = "force-dynamic";

import { getGastos } from "@/features/expenses/actions/expense-actions";
import { getInsumos } from "@/features/inventory/actions/insumo-actions";
import { ExpenseForms } from "@/features/expenses/components/ExpenseForms";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { Suspense } from "react";
import { DateRangeFilter } from "@/features/reports/components/DateRangeFilter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function GastosPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  const startDate = searchParams.start || new Date().toISOString().split('T')[0];
  const endDate = searchParams.end || new Date().toISOString().split('T')[0];

  const [gastosRes, insumosRes] = await Promise.all([
    getGastos(startDate, endDate),
    getInsumos()
  ]);

  const gastos = gastosRes.success ? gastosRes.data || [] : [];
  const insumos = insumosRes.success ? insumosRes.data || [] : [];

  const insumosMap = insumos.map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidadCompra: i.unidadCompra,
    unidadMedida: i.unidadMedida
  }));

  const totalGastosRango = gastos.reduce((sum: number, g: any) => sum + g.montoTotal, 0);
  const totalInsumos = gastos.filter((g: any) => g.tipo === "COMPRA_INSUMO").reduce((sum: number, g: any) => sum + g.montoTotal, 0);
  const totalOperativos = gastos.filter((g: any) => g.tipo === "OPERATIVO").reduce((sum: number, g: any) => sum + g.montoTotal, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 p-2 px-4 text-gray-500 hover:text-[#A13E21] hover:bg-[#F4EEE2] rounded-full transition font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> Inicio
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#A13E21]">Gastos y Compras</h1>
            <p className="text-[#6E6C41] text-sm font-semibold">Inyección de inventario y salidas de caja</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">Cargando filtros...</div>}>
        <DateRangeFilter />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formularios e Indicadores */}
        <div className="lg:col-span-1 space-y-6">
          <ExpenseForms insumos={insumosMap} />

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Salidas (Rango)</p>
              <p className="text-4xl font-black text-red-500">{formatCurrency(totalGastosRango)}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Insumos</p>
                <p className="text-lg font-bold text-gray-700">{formatCurrency(totalInsumos)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Operativos</p>
                <p className="text-lg font-bold text-gray-700">{formatCurrency(totalOperativos)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-700">Historial de Salidas</h2>
          <ExpenseList gastos={gastos as any} />
        </div>
      </div>
    </div>
  );
}
