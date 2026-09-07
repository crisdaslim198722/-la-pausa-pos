import { RecipeBuilder } from "@/features/inventory/components/RecipeBuilder";
import { getInsumos } from "@/features/inventory/actions/insumo-actions";

export default async function CrearProductoPage() {
  const { data: insumos = [] } = await getInsumos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Crear Producto</h1>
        <p className="text-[#6E6C41] mt-2">Arma la receta añadiendo los insumos necesarios. El costo se calculará en tiempo real.</p>
      </div>

      <RecipeBuilder insumosDisponibles={insumos} />
    </div>
  );
}
