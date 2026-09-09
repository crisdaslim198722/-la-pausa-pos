import { getGastos } from "@/features/expenses/actions/expense-actions";
import { getInsumos } from "@/features/inventory/actions/insumo-actions";
import { ExpenseForms } from "@/features/expenses/components/ExpenseForms";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GastosPage() {
  const [gastosRes, insumosRes] = await Promise.all([
    getGastos(),
    getInsumos()
  ]);

  const gastos = gastosRes.success ? gastosRes.data || [] : [];
  const insumos = insumosRes.success ? insumosRes.data || [] : [];

  const insumosMap = insumos.map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidadCompra: i.unidadCompra
  }));

  const totalGastosMes = gastos.reduce((sum: number, g: any) => sum + g.montoTotal, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formularios */}
        <div className="lg:col-span-1 space-y-6">
          <ExpenseForms insumos={insumosMap} />

          <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Salidas (Histórico)</p>
            <p className="text-4xl font-black text-red-400">${totalGastosMes.toFixed(2)}</p>
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
