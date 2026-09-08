import { getPrecioProductoDetail } from "@/features/inventory/actions/pricing-actions";
import { PrecioForm } from "@/features/inventory/components/PrecioForm";
import { notFound } from "next/navigation";

export default async function EditarPrecioPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const { data: producto, error } = await getPrecioProductoDetail(id);

  if (!producto || error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Ajustar Precio</h1>
        <p className="text-[#6E6C41] mt-2">
          Modifica el precio de <strong>{producto.nombre}</strong>. Los pedidos pasados no se verán afectados.
        </p>
      </div>

      <PrecioForm producto={producto} isEdit={true} />
    </div>
  );
}
