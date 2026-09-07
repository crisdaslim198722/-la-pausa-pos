import { z } from 'zod';

export const ItemRecetaSchema = z.object({
  insumoId: z.string().uuid("Seleccione un insumo válido"),
  cantidad: z
    .number({ message: "Ingrese una cantidad válida" })
    .gt(0, "La cantidad debe ser mayor a 0"),
});

export const CreateProductoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del producto es obligatorio")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .transform((val) => val.trim().toLowerCase()),
  insumos: z
    .array(ItemRecetaSchema)
    .min(1, "Debe asociar al menos 1 insumo para crear el producto"),
});

export const UpdateProductoSchema = z.object({
  insumos: z
    .array(ItemRecetaSchema)
    .min(1, "El producto debe contener al menos 1 insumo en su receta"),
});

export type CreateProductoInput = z.input<typeof CreateProductoSchema>;
export type UpdateProductoInput = z.infer<typeof UpdateProductoSchema>;
