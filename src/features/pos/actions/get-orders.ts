"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveOrders() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Desde inicio del día actual (local time approximation)

    const orders = await prisma.pedido.findMany({
      where: {
        fechaHora: {
          gte: today,
        }
      },
      orderBy: { fechaHora: "desc" },
      include: {
        detalles: {
          include: {
            producto: { select: { nombre: true } }
          }
        }
      }
    });

    const serialized = orders.map(o => ({
      ...o,
      totalVenta: Number(o.totalVenta),
      costoTotalPedido: Number(o.costoTotalPedido),
      gananciaNeta: Number(o.gananciaNeta),
      fechaHora: o.fechaHora.toISOString(),
      detalles: o.detalles.map(d => ({
        ...d,
        precioVentaHistorico: Number(d.precioVentaHistorico),
        costoHistorico: Number(d.costoHistorico),
      }))
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: "Error al obtener las órdenes" };
  }
}
