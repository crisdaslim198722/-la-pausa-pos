import { InsumoForm } from "@/features/inventory/components/InsumoForm";
import { getInsumoById } from "@/features/inventory/actions/insumo-actions";
import { notFound } from "next/navigation";

export default async function EditarInsumoPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { data: insumo, error } = await getInsumoById(id);

  if (!insumo || error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Editar Insumo</h1>
        <p className="text-[#6E6C41] mt-2">Modifica los costos y rendimientos. El nombre no puede ser alterado.</p>
      </div>

      <InsumoForm initialData={insumo} />
    </div>
  );
}
