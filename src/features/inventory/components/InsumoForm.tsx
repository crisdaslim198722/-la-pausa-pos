"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createInsumo, updateInsumo } from "../actions/insumo-actions";
import { UNIDADES_CATALOGO, CreateInsumoInput } from "../schemas/insumo";

interface InsumoFormProps {
  initialData?: any;
}

export function InsumoForm({ initialData }: InsumoFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [unidadCompra, setUnidadCompra] = useState(initialData?.unidadCompra || "unidades");
  const [unidadMedida, setUnidadMedida] = useState(initialData?.unidadMedida || "gramos");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const payload: CreateInsumoInput = {
      nombre,
      unidadCompra: unidadCompra as any,
      unidadMedida: unidadMedida as any,
    };

    let res;
    if (isEditing) {
      res = await updateInsumo(initialData.id, payload as any);
    } else {
      res = await createInsumo(payload as any);
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-[#B49659]/30 max-w-xl mx-auto">
      {errorMsg && (
        <div className="mb-6 p-3 bg-[#A13E21]/10 text-[#A13E21] rounded border border-[#A13E21]/20">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
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
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Unidad de compra (Presentación)</label>
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
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Unidad de medida (Para Recetas)</label>
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

        {!isEditing && (
          <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
            <strong>Nota:</strong> El precio y el rendimiento se registrarán automáticamente cuando agregues tu primera compra de este insumo en la sección de <strong>Gastos</strong>.
          </div>
        )}
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
          disabled={loading}
          className="px-6 py-2 bg-[#A13E21] text-white font-semibold rounded hover:bg-[#A13E21]/90 disabled:opacity-50 transition"
        >
          {loading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Insumo")}
        </button>
      </div>
    </form>
  );
}
