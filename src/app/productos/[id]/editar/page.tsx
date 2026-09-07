import { RecipeBuilder } from "@/features/inventory/components/RecipeBuilder";
import { getInsumos } from "@/features/inventory/actions/insumo-actions";
import { getProductoById } from "@/features/inventory/actions/producto-actions";
import { notFound } from "next/navigation";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // Fetchear producto e insumos en paralelo
  const [productoRes, insumosRes] = await Promise.all([
    getProductoById(id),
    getInsumos()
  ]);

  if (!productoRes.data || productoRes.error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Editar Receta</h1>
        <p className="text-[#6E6C41] mt-2">Ajusta los ingredientes y sus cantidades. El nombre del producto no se puede cambiar.</p>
      </div>

      <RecipeBuilder initialData={productoRes.data} insumosDisponibles={insumosRes.data || []} />
    </div>
  );
}
