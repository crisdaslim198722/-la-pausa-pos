"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addProductsToOrder(orderId: string, items: { productoId: string; cantidad: number }[]) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: orderId }
    });

    if (!pedido) {
      return { success: false, error: "Pedido no encontrado" };
    }

    if (pedido.estado === "PAGADO" || pedido.estado === "CANCELADO") {
      return { success: false, error: "No se puede editar un pedido cerrado" };
    }

    const productIds = items.map(i => i.productoId);
    const productosDb = await prisma.producto.findMany({
      where: { id: { in: productIds } },
      include: { receta: true }
    });

    const productosMap = new Map(productosDb.map(p => [p.id, p]));

    let totalVentaAdicional = 0;
    let costoTotalAdicional = 0;
    const insumosADescontar = new Map<string, number>();

    const detallesParaInsertar = items.map(item => {
      const p = productosMap.get(item.productoId)!;
      
      const cantidadVendida = item.cantidad;
      const precioVentaHistorico = Number(p.precioVentaActual);
      const costoHistorico = Number(p.costoTotal);

      totalVentaAdicional += (precioVentaHistorico * cantidadVendida);
      costoTotalAdicional += (costoHistorico * cantidadVendida);

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
        despachado: false
      };
    });

    const nuevoTotalVenta = Number(pedido.totalVenta) + totalVentaAdicional;
    const nuevoCostoTotal = Number(pedido.costoTotalPedido) + costoTotalAdicional;
    const nuevaGanancia = nuevoTotalVenta - nuevoCostoTotal;

    await prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id: orderId },
        data: {
          totalVenta: nuevoTotalVenta,
          costoTotalPedido: nuevoCostoTotal,
          gananciaNeta: nuevaGanancia,
          estado: "ACTIVO",
          detalles: {
            create: detallesParaInsertar
          }
        }
      });

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
    revalidatePath("/inventario/insumos");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al agregar productos" };
  }
}
