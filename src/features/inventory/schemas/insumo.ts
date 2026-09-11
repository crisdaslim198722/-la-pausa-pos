import { z } from 'zod';

export const UNIDADES_CATALOGO = ['gramos', 'mililitros', 'porcion', 'unidades', 'cajas', 'bolsas', 'botellas', 'paquetes', 'kilos', 'litros'] as const;

export const CreateInsumoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del insumo es obligatorio")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  unidadCompra: z.enum(UNIDADES_CATALOGO, {
    errorMap: () => ({ message: "Seleccione una unidad de compra válida" }),
  }),
  precioCompra: z.number().default(0),
  rendimientoUnidad: z.number().min(0.01, "El rendimiento debe ser mayor a 0"),
  unidadMedida: z.enum(UNIDADES_CATALOGO, {
    errorMap: () => ({ message: "Seleccione una unidad de medida válida" }),
  }),
});

export const UpdateInsumoSchema = CreateInsumoSchema.omit({ nombre: true });

export type CreateInsumoInput = z.input<typeof CreateInsumoSchema>;
export type UpdateInsumoInput = z.infer<typeof UpdateInsumoSchema>;
