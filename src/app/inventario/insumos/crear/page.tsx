import { InsumoForm } from "@/features/inventory/components/InsumoForm";

export default function CrearInsumoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#A13E21]">Crear Insumo</h1>
        <p className="text-[#6E6C41] mt-2">Registra una nueva materia prima y el sistema calculará su costo unitario.</p>
      </div>

      <InsumoForm />
    </div>
  );
}
