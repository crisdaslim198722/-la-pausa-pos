"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrder(id: string) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: {
              include: {
                receta: true
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      return { success: false, error: "Pedido no encontrado" };
    }

    if (pedido.estado !== "ACTIVO") {
      return { success: false, error: "Solo se pueden cancelar pedidos en preparación" };
    }

    const insumosADevolver = new Map<string, number>();

    pedido.detalles.forEach(detalle => {
      if (detalle.despachado) return;

      detalle.producto.receta.forEach(recetaItem => {
        const insumoId = recetaItem.insumoId;
        const cantidadDevuelta = Number(recetaItem.cantidad) * detalle.cantidadVendida;
        const actual = insumosADevolver.get(insumoId) || 0;
        insumosADevolver.set(insumoId, actual + cantidadDevuelta);
      });
    });

    await prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id },
        data: { estado: "CANCELADO" }
      });

      for (const [insumoId, cantidad] of insumosADevolver.entries()) {
        await tx.insumo.update({
          where: { id: insumoId },
          data: {
            cantidadDisponible: {
              increment: cantidad
            }
          }
        });
      }
    });

    revalidatePath("/pos/ordenes");
    revalidatePath("/inventario/insumos");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al cancelar el pedido" };
  }
}
