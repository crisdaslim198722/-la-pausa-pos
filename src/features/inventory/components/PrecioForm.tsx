"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertCircle, Calculator } from "lucide-react";
import { setPrecioVenta } from "../actions/pricing-actions";

interface Insumo {
  id: string;
  nombre: string;
  unidadMedida: string;
}

interface RecetaItem {
  cantidad: number;
  costoSubtotal: number;
  insumo: Insumo;
}

interface ProductoDetail {
  id: string;
  nombre: string;
  costoTotal: number;
  precioVentaActual: number;
  receta: RecetaItem[];
}

interface Props {
  producto: ProductoDetail;
  isEdit?: boolean;
}

export function PrecioForm({ producto, isEdit = false }: Props) {
  const router = useRouter();
  const [precio, setPrecio] = useState<number | "">(
    producto.precioVentaActual > 0 ? producto.precioVentaActual : ""
  );
  const [loading, setLoading] = useState(false);

  const costoTotal = producto.costoTotal;
  const precioNum = typeof precio === "number" ? precio : 0;
  
  const margenAbsoluto = precioNum > 0 ? precioNum - costoTotal : 0;
  const margenRelativo = precioNum > 0 ? (margenAbsoluto / precioNum) * 100 : 0;

  const isNegativo = precioNum > 0 && margenAbsoluto < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (precioNum <= 0) {
      toast.error("El precio de venta debe ser mayor a 0");
      return;
    }

    setLoading(true);

    const res = await setPrecioVenta({
      productoId: producto.id,
      precioVentaActual: precioNum,
    });

    setLoading(false);

    if (res.success) {
      toast.success(isEdit ? "Precio actualizado exitosamente" : "Precio asignado exitosamente");
      router.push("/inventario/precios");
    } else {
      toast.error(res.error || "Error al guardar el precio");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Información de Receta (Lectura) */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-[#6E6C41] mb-4 border-b pb-2">Desglose de Costos</h3>
        
        <div className="space-y-3 mb-6">
          {producto.receta.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">
                {item.cantidad} {item.insumo.unidadMedida.slice(0,3)}. {item.insumo.nombre}
              </span>
              <span className="font-medium text-gray-800">${item.costoSubtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#F4EEE2] rounded flex justify-between items-center border border-[#B49659]/20">
          <span className="font-bold text-[#6E6C41]">Costo Total:</span>
          <span className="font-bold text-xl text-[#A13E21]">${costoTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Precio y Simulador */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-[#B49659]/30">
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Precio de Venta Sugerido / Actual</label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-3 text-gray-500 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#A13E21] focus:outline-none text-xl font-bold text-gray-800"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              <Calculator className="w-4 h-4" /> Proyección de Rentabilidad
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${isNegativo ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                <p className="text-sm text-gray-500 font-medium mb-1">Margen Absoluto ($)</p>
                <p className={`text-2xl font-bold ${isNegativo ? 'text-red-600' : 'text-green-600'}`}>
                  ${margenAbsoluto.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${isNegativo ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                <p className="text-sm text-gray-500 font-medium mb-1">Margen Relativo (%)</p>
                <p className={`text-2xl font-bold ${isNegativo ? 'text-red-600' : 'text-green-600'}`}>
                  {margenRelativo.toFixed(2)}%
                </p>
              </div>
            </div>

            {isNegativo && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span><strong>Atención:</strong> El precio de venta es menor al costo de producción. Tendrás pérdidas económicas.</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/inventario/precios")}
              className="px-6 py-2 text-[#6E6C41] hover:bg-gray-100 rounded font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || precioNum <= 0}
              className="px-8 py-2 bg-[#A13E21] text-white font-bold rounded hover:bg-[#A13E21]/90 disabled:opacity-50 transition"
            >
              {loading ? "Guardando..." : "Guardar Precio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
