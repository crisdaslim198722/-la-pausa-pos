export const dynamic = "force-dynamic";

import { getPreciosProductosList } from "@/features/inventory/actions/pricing-actions";
import { PricingListTable } from "@/features/inventory/components/PricingListTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PreciosPage() {
  const { data: productos = [], error } = await getPreciosProductosList();

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
          <h1 className="text-3xl font-bold text-[#A13E21]">Márgenes y Precios</h1>
          <p className="text-[#6E6C41] mt-2">Analiza la rentabilidad de tus productos y ajusta los precios de venta al público.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <PricingListTable productos={productos} />
    </div>
  );
}
