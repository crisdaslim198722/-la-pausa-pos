"use client";

import { DollarSign, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface MetricsProps {
  ingresosTotales: number;
  costoProduccion: number;
  gananciaNeta: number;
  dineroPendiente: number;
  margenPorcentaje: number;
}

export function MetricsCards({ metrics }: { metrics: MetricsProps }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ganancia Neta (Destacada) */}
      <div className="bg-[#A13E21] text-white p-6 rounded-xl shadow-md lg:col-span-2 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Ganancia Neta
          </p>
          <p className="text-5xl font-black">{formatCurrency(Number(metrics.gananciaNeta))}</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">
            <Activity className="w-4 h-4" /> Margen Rentabilidad: {metrics.margenPorcentaje.toFixed(1)}%
          </div>
        </div>
        <DollarSign className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10" />
      </div>

      {/* Ingresos Brutos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
          Ingresos Brutos
        </p>
        <p className="text-3xl font-black text-gray-800">{formatCurrency(Number(metrics.ingresosTotales))}</p>
        <p className="text-xs text-gray-400 mt-2">Caja cobrada</p>
      </div>

      {/* Costo de Producción */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" /> Costos Producción
        </p>
        <p className="text-3xl font-black text-gray-800">{formatCurrency(Number(metrics.costoProduccion))}</p>
        <p className="text-xs text-gray-400 mt-2">Inversión en insumos</p>
      </div>

      {/* Dinero Pendiente */}
      {metrics.dineroPendiente > 0 && (
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 lg:col-span-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-orange-800">
            <Clock className="w-6 h-6" />
            <div>
              <p className="font-bold">Cuentas por Cobrar</p>
              <p className="text-sm opacity-90">Hay dinero pendiente en la barra de órdenes activas o despachadas.</p>
            </div>
          </div>
          <p className="text-2xl font-black text-orange-700">{formatCurrency(Number(metrics.dineroPendiente))}</p>
        </div>
      )}
    </div>
  );
}
