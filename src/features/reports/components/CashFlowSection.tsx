import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface CashFlowProps {
  ingresosTotales: number;
  comprasInsumos: number;
  gastosOperativos: number;
  flujoCajaNeto: number;
  totalSalidas: number;
}

export function CashFlowSection({ metrics }: { metrics: CashFlowProps }) {
  const isPositive = metrics.flujoCajaNeto >= 0;

  // Para evitar división por cero en las barras de progreso
  const maxMonto = Math.max(metrics.ingresosTotales, metrics.totalSalidas, 1);
  const ingresosPorcentaje = (metrics.ingresosTotales / maxMonto) * 100;
  const salidasPorcentaje = (metrics.totalSalidas / maxMonto) * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-800">Flujo de Caja Real</h2>
          <p className="text-sm text-gray-500 font-medium">Entradas vs Salidas de dinero</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resumen Visual */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-green-600 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Entradas (Ventas)</span>
              <span className="text-gray-800">{formatCurrency(metrics.ingresosTotales)}</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${ingresosPorcentaje}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-red-500 flex items-center gap-1"><TrendingDown className="w-4 h-4"/> Salidas Totales</span>
              <span className="text-gray-800">{formatCurrency(metrics.totalSalidas)}</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${salidasPorcentaje}%` }} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-600">Flujo Neto:</span>
            <span className={`text-2xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(metrics.flujoCajaNeto)}
            </span>
          </div>
        </div>

        {/* Desglose de Salidas */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Desglose de Salidas
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Materia Prima</p>
                <p className="text-xs text-gray-500">Insumos y abastecimiento</p>
              </div>
              <span className="font-black text-gray-700">{formatCurrency(metrics.comprasInsumos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Gastos Operativos</p>
                <p className="text-xs text-gray-500">Arriendo, nómina, servicios, etc.</p>
              </div>
              <span className="font-black text-gray-700">{formatCurrency(metrics.gastosOperativos)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-500">Total Gastado</span>
              <span className="font-black text-red-600">{formatCurrency(metrics.totalSalidas)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
