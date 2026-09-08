import { z } from 'zod';

export const OrderItemSchema = z.object({
  productoId: z.string().uuid("Identificador de producto inválido"),
  cantidad: z
    .number({ invalid_type_error: "Cantidad inválida" })
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
});

export const CreateOrderSchema = z.object({
  nombreCliente: z.string().max(100, "Nombre muy largo").optional(),
  items: z
    .array(OrderItemSchema)
    .min(1, "El pedido debe contener al menos 1 producto"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
