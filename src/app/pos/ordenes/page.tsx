import { getActiveOrders } from "@/features/pos/actions/get-orders";
import { ActiveOrdersList } from "@/features/pos/components/ActiveOrdersList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function POSOrdenesPage() {
  const { data: pedidos = [], error } = await getActiveOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link 
          href="/pos" 
          className="p-2 text-gray-500 hover:text-[#A13E21] hover:bg-[#F4EEE2] rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#A13E21]">Órdenes Activas</h1>
          <p className="text-[#6E6C41] text-sm font-semibold">Turno de hoy</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : (
        <ActiveOrdersList pedidos={pedidos as any} />
      )}
    </div>
  );
}
