"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderSchema, CreateOrderInput } from "../schemas/order";
import { revalidatePath } from "next/cache";

export async function createOrderTransaction(data: CreateOrderInput) {
  try {
    const validated = CreateOrderSchema.parse(data);

    // 1. Obtener productos y sus recetas actuales para garantizar la seguridad de los precios/costos
    const productIds = validated.items.map(i => i.productoId);
    const productosDb = await prisma.producto.findMany({
      where: { id: { in: productIds } },
      include: { receta: true }
    });

    if (productosDb.length !== productIds.length) {
      return { success: false, error: "Algunos productos no existen en la base de datos" };
    }

    const productosMap = new Map(productosDb.map(p => [p.id, p]));

    // 2. Construir los Detalles del Pedido y totalizar
    let totalVenta = 0;
    let costoTotalPedido = 0;
    
    // Necesitamos llevar registro de cuánto descontar de cada insumo
    const insumosADescontar = new Map<string, number>();

    const detallesParaInsertar = validated.items.map(item => {
      const p = productosMap.get(item.productoId)!;
      
      if (Number(p.precioVentaActual) <= 0) {
        throw new Error(`El producto ${p.nombre} no tiene precio asignado`);
      }

      const cantidadVendida = item.cantidad;
      const precioVentaHistorico = Number(p.precioVentaActual);
      const costoHistorico = Number(p.costoTotal);

      totalVenta += (precioVentaHistorico * cantidadVendida);
      costoTotalPedido += (costoHistorico * cantidadVendida);

      // Calcular consumo de insumos para esta línea
      p.receta.forEach(recetaItem => {
        const insumoId = recetaItem.insumoId;
        const cantidadConsumida = Number(recetaItem.cantidad) * cantidadVendida;
        const actual = insumosADescontar.get(insumoId) || 0;
        insumosADescontar.set(insumoId, actual + cantidadConsumida);
      });

      return {
        productoId: p.id,
        cantidadVendida,
        precioVentaHistorico,
        costoHistorico,
      };
    });

    const gananciaNeta = totalVenta - costoTotalPedido;

    // 3. Ejecutar la Transacción Atómica
    await prisma.$transaction(async (tx) => {
      // 3.a. Crear el Pedido y sus Detalles
      await tx.pedido.create({
        data: {
          nombreCliente: validated.nombreCliente || null,
          totalVenta,
          costoTotalPedido,
          gananciaNeta,
          detalles: {
            create: detallesParaInsertar
          }
        }
      });

      // 3.b. Descontar Insumos
      for (const [insumoId, cantidadADescontar] of insumosADescontar.entries()) {
        await tx.insumo.update({
          where: { id: insumoId },
          data: {
            cantidadDisponible: {
              decrement: cantidadADescontar
            }
          }
        });
      }
    });

    revalidatePath("/pos");
    revalidatePath("/pos/ordenes");
    revalidatePath("/inventario/insumos"); // Actualiza la vista de inventario
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al procesar el pedido" };
  }
}
