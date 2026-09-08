import { z } from "zod";

export const CreateInsumoPurchaseSchema = z.object({
  insumoId: z.string().min(1, "Debes seleccionar un insumo"),
  cantidadComprada: z.number().positive("La cantidad debe ser mayor a 0"),
  montoTotal: z.number().positive("El costo total debe ser mayor a 0"),
  actualizarCosto: z.boolean().default(false),
});

export const CreateOperativeExpenseSchema = z.object({
  descripcion: z.string().min(3, "La descripción es muy corta").max(200, "Muy larga"),
  montoTotal: z.number().positive("El monto debe ser mayor a 0"),
});
