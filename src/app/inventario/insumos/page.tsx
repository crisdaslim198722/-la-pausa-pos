import { getInsumos } from "@/features/inventory/actions/insumo-actions";
import { InsumoTable } from "@/features/inventory/components/InsumoTable";

export default async function InsumosPage() {
  const { data: insumos = [], error } = await getInsumos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Inventario de Insumos</h1>
        <p className="text-[#6E6C41] mt-2">Gestiona las materias primas y su costo base para las recetas.</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <InsumoTable insumos={insumos} />
    </div>
  );
}
