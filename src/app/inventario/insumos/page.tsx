export const dynamic = "force-dynamic";
import { getInsumos } from "@/features/inventory/actions/insumo-actions";
import { InsumoTable } from "@/features/inventory/components/InsumoTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InsumosPage() {
  const { data: insumos = [], error } = await getInsumos();

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
          <h1 className="text-3xl font-bold text-[#A13E21]">Inventario de Insumos</h1>
          <p className="text-[#6E6C41] mt-2">Gestiona las materias primas y su costo base para las recetas.</p>
        </div>
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

