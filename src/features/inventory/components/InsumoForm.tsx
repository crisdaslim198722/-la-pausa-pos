"use client";

import { useState, useMemo } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createInsumo, updateInsumo } from "../actions/insumo-actions";
import { UNIDADES_CATALOGO, CreateInsumoInput } from "../schemas/insumo";

interface InsumoFormProps {
  initialData?: any; // Datos si es edición
}

export function InsumoForm({ initialData }: InsumoFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [unidadCompra, setUnidadCompra] = useState(initialData?.unidadCompra || "unidades");
  const [precioCompra, setPrecioCompra] = useState<number | "">(initialData ? Number(initialData.precioCompra) : "");
  const [rendimientoUnidad, setRendimientoUnidad] = useState<number | "">(initialData ? Number(initialData.rendimientoUnidad) : "");
  const [unidadMedida, setUnidadMedida] = useState(initialData?.unidadMedida || "gramos");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const costoUnitario = useMemo(() => {
    if (typeof precioCompra === 'number' && typeof rendimientoUnidad === 'number' && rendimientoUnidad > 0) {
      return (precioCompra / rendimientoUnidad).toFixed(2);
    }
    return "0.00";
  }, [precioCompra, rendimientoUnidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (typeof rendimientoUnidad !== 'number' || rendimientoUnidad <= 0) {
      setErrorMsg("El rendimiento debe ser mayor a 0");
      return;
    }
    if (typeof precioCompra !== 'number' || precioCompra < 0) {
      setErrorMsg("El precio de compra no puede ser negativo");
      return;
    }

    setLoading(true);

    const payload: CreateInsumoInput = {
      nombre,
      unidadCompra: unidadCompra as any,
      precioCompra: Number(precioCompra),
      rendimientoUnidad: Number(rendimientoUnidad),
      unidadMedida: unidadMedida as any,
    };

    let res;
    if (isEditing) {
      res = await updateInsumo(initialData.id, payload);
    } else {
      res = await createInsumo(payload);
    }

    setLoading(false);

    if (res.success) {
      toast.success(isEditing ? "Insumo actualizado exitosamente" : "Insumo creado exitosamente");
      router.push("/inventario/insumos");
    } else {
      setErrorMsg(res.error || "Ocurrió un error");
      toast.error(res.error || "Ocurrió un error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-[#B49659]/30 max-w-2xl mx-auto">
      {errorMsg && (
        <div className="mb-6 p-3 bg-[#A13E21]/10 text-[#A13E21] rounded border border-[#A13E21]/20">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Nombre del insumo</label>
          <input
            type="text"
            required
            disabled={isEditing}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Ej. Café Tostado"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Unidad de compra</label>
          <select
            value={unidadCompra}
            onChange={(e) => setUnidadCompra(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none bg-white"
          >
            {UNIDADES_CATALOGO.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Precio de compra</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
            <CurrencyInput
              id="precioCompra"
              required
              value={typeof precioCompra === 'number' ? precioCompra : 0}
              onChange={(val) => setPrecioCompra(val)}
              className="w-full p-2 pl-7 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Rendimiento de la unidad</label>
          <input
            type="number"
            step="0.01"
            required
            value={rendimientoUnidad}
            onChange={(e) => setRendimientoUnidad(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none"
            placeholder="Ej. 1000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Unidad de medida</label>
          <select
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none bg-white"
          >
            {UNIDADES_CATALOGO.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-[#B8CCC5]/30 rounded flex justify-between items-center border border-[#B8CCC5]/50">
          <span className="text-[#6E6C41] font-semibold">Costo Unitario Calculado:</span>
          <span className="text-xl font-bold text-[#A13E21]">${Number(costoUnitario).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / {unidadMedida}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={() => router.push("/inventario/insumos")}
          className="px-4 py-2 text-[#6E6C41] hover:bg-gray-100 rounded font-semibold transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || (typeof rendimientoUnidad === 'number' && rendimientoUnidad <= 0)}
          className="px-6 py-2 bg-[#A13E21] text-white font-semibold rounded hover:bg-[#A13E21]/90 disabled:opacity-50 transition"
        >
          {loading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Guardar Insumo")}
        </button>
      </div>
    </form>
  );
}
