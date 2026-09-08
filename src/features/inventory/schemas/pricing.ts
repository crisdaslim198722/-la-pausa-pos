import { z } from 'zod';

export const SetPrecioVentaSchema = z.object({
  productoId: z.string().uuid("Identificador de producto inválido"),
  precioVentaActual: z
    .number({ invalid_type_error: "Ingrese un precio de venta válido" })
    .gt(0, "El precio de venta debe ser mayor a 0"),
});

export type SetPrecioVentaInput = z.infer<typeof SetPrecioVentaSchema>;
