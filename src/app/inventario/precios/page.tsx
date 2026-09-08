import { getPreciosProductosList } from "@/features/inventory/actions/pricing-actions";
import { PricingListTable } from "@/features/inventory/components/PricingListTable";

export default async function PreciosPage() {
  const { data: productos = [], error } = await getPreciosProductosList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Márgenes y Precios</h1>
        <p className="text-[#6E6C41] mt-2">Analiza la rentabilidad de tus productos y ajusta los precios de venta al público.</p>
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
