import { getPreciosProductosList } from "@/features/inventory/actions/pricing-actions";
import { POSProductGrid } from "@/features/pos/components/POSProductGrid";
import { POSCartBar } from "@/features/pos/components/POSCartBar";
import { POSCartProvider } from "@/features/pos/components/POSCartContext";
import Link from "next/link";
import { Clock } from "lucide-react";

export default async function POSPage() {
  const { data: productos = [] } = await getPreciosProductosList();

  return (
    <POSCartProvider>
      <div className="min-h-screen bg-gray-50 -m-4 sm:-m-8 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#A13E21]">Punto de Venta</h1>
              <p className="text-[#6E6C41] text-sm font-semibold">Toma de pedidos rápida</p>
            </div>
            <Link 
              href="/pos/ordenes" 
              className="bg-white border border-[#B49659]/30 text-[#B49659] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#F4EEE2] transition flex items-center gap-2 shadow-sm"
            >
              <Clock className="w-4 h-4" /> Órdenes Activas
            </Link>
          </div>

          <POSProductGrid productos={productos} />
        </div>
      </div>
      <POSCartBar />
    </POSCartProvider>
  );
}
