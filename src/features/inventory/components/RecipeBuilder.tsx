"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { createProducto, updateProducto } from "../actions/producto-actions";

interface Insumo {
  id: string;
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
}

interface RecetaItem {
  insumoId: string;
  cantidad: number | "";
  insumoInfo?: Insumo; // Auxiliar para UI
}

interface RecipeBuilderProps {
  initialData?: any;
  insumosDisponibles: Insumo[];
}

export function RecipeBuilder({ initialData, insumosDisponibles }: RecipeBuilderProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  
  const initialItems: RecetaItem[] = initialData?.receta?.map((r: any) => ({
    insumoId: r.insumoId,
    cantidad: r.cantidad,
    insumoInfo: r.insumo,
  })) || [];

  const [items, setItems] = useState<RecetaItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<number | null>(null); // Index of item to delete

  // Costo Total calculo reactivo
  const costoTotal = useMemo(() => {
    let sum = 0;
    items.forEach(item => {
      if (typeof item.cantidad === 'number' && item.cantidad > 0) {
        const insumo = insumosDisponibles.find(i => i.id === item.insumoId) || item.insumoInfo;
        if (insumo) {
          sum += (item.cantidad * Number(insumo.costoUnitario));
        }
      }
    });
    return sum.toFixed(2);
  }, [items, insumosDisponibles]);

  const handleAddItem = () => {
    setItems([...items, { insumoId: "", cantidad: "" }]);
  };

  const updateItem = (index: number, field: keyof RecetaItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "insumoId") {
      newItems[index].insumoInfo = insumosDisponibles.find(i => i.id === value);
    }
    setItems(newItems);
  };

  const confirmDelete = () => {
    if (showModal !== null) {
      setItems(items.filter((_, i) => i !== showModal));
      setShowModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error(isEditing ? "El producto debe contener al menos 1 insumo en su receta" : "Debe asociar al menos 1 insumo para crear el producto");
      return;
    }

    if (items.some(i => typeof i.cantidad !== 'number' || i.cantidad <= 0)) {
      toast.error("La cantidad debe ser mayor a 0 en todos los insumos");
      return;
    }

    if (items.some(i => !i.insumoId)) {
      toast.error("Seleccione un insumo válido en todas las filas");
      return;
    }

    setLoading(true);

    const payload = {
      nombre,
      insumos: items.map(i => ({
        insumoId: i.insumoId,
        cantidad: Number(i.cantidad),
      }))
    };

    const res = isEditing 
      ? await updateProducto(initialData.id, { insumos: payload.insumos })
      : await createProducto(payload);

    setLoading(false);

    if (res.success) {
      toast.success(isEditing ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
      router.push("/productos");
    } else {
      toast.error(res.error || "Ocurrió un error");
    }
  };

  const selectedInsumoIds = items.map(i => i.insumoId).filter(Boolean);

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-[#B49659]/30 max-w-4xl mx-auto">
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#6E6C41] mb-2">Nombre del producto</label>
          <input
            type="text"
            required
            disabled={isEditing}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Ej. Latte 12oz"
          />
        </div>

        <div className="mb-4 flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-[#A13E21]">Receta del Producto</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm flex items-center gap-1 text-[#B49659] hover:text-[#A13E21] transition font-semibold"
          >
            <Plus className="w-4 h-4" /> Agregar Insumo
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item, index) => {
            const insumo = insumosDisponibles.find(i => i.id === item.insumoId) || item.insumoInfo;
            const subtotal = typeof item.cantidad === 'number' && item.cantidad > 0 && insumo 
              ? (item.cantidad * Number(insumo.costoUnitario)).toFixed(2)
              : "0.00";

            return (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Insumo</label>
                  <select
                    required
                    value={item.insumoId}
                    onChange={(e) => updateItem(index, "insumoId", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none bg-white text-sm"
                  >
                    <option value="" disabled>Seleccione un insumo...</option>
                    {insumosDisponibles.map(i => (
                      <option 
                        key={i.id} 
                        value={i.id} 
                        disabled={selectedInsumoIds.includes(i.id) && item.insumoId !== i.id}
                        className="capitalize"
                      >
                        {i.nombre} - {formatCurrency(Number(i.costoUnitario))}/{i.unidadMedida}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full md:w-32">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Cantidad</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={item.cantidad}
                      onChange={(e) => updateItem(index, "cantidad", e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:border-[#A13E21] focus:outline-none text-sm pr-12"
                    />
                    <span className="absolute right-2 top-2 text-xs text-gray-400 capitalize pointer-events-none">
                      {insumo ? insumo.unidadMedida.slice(0,3) : ""}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-32">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subtotal</label>
                  <div className="p-2 bg-white border border-gray-200 rounded text-sm text-[#A13E21] font-medium text-right">
                    {formatCurrency(Number(subtotal))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(index)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition mb-[1px]"
                  title="Eliminar insumo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center p-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
              No hay insumos en esta receta. Haga clic en "Agregar Insumo".
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 bg-[#F4EEE2] rounded border border-[#B49659]/30 mb-8">
          <span className="text-[#6E6C41] font-bold text-lg">Costo Total de Preparación:</span>
          <span className="text-2xl font-bold text-[#A13E21]">{formatCurrency(Number(costoTotal))}</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/productos")}
            className="px-4 py-2 text-[#6E6C41] hover:bg-gray-100 rounded font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-[#A13E21] text-white font-semibold rounded hover:bg-[#A13E21]/90 disabled:opacity-50 transition"
          >
            {loading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Guardar Producto")}
          </button>
        </div>
      </form>

      {/* Modal de confirmación */}
      {showModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Eliminar Insumo</h4>
            <p className="text-gray-600 mb-6">¿Está seguro de eliminar este insumo de la receta?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
