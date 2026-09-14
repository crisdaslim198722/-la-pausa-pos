"use server";

import { prisma } from "@/lib/prisma";

export async function getFinancialMetrics(startDateStr?: string, endDateStr?: string) {
  try {
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (startDateStr) {
      const parsedStart = new Date(startDateStr);
      if (!isNaN(parsedStart.getTime())) startDate = parsedStart;
    }
    
    if (endDateStr) {
      const parsedEnd = new Date(endDateStr);
      if (!isNaN(parsedEnd.getTime())) {
        parsedEnd.setHours(23, 59, 59, 999);
        endDate = parsedEnd;
      }
    }

    const pedidos = await prisma.pedido.findMany({
      where: {
        fechaHora: {
          gte: startDate,
          lte: endDate,
        },
        estado: {
          in: ["PAGADO", "ACTIVO", "DESPACHADO"]
        }
      },
      include: {
        detalles: {
          include: {
            producto: { select: { nombre: true } }
          }
        }
      }
    });

    const gastos = await prisma.gasto.findMany({
      where: {
        fechaHora: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    let ingresosTotales = 0;
    let costoProduccion = 0;
    let gananciaNeta = 0;
    let dineroPendiente = 0;
    let ordenesPagadas = 0;

    const productoStats = new Map<string, { nombre: string; cantidadVendida: number; ingresoGenerado: number }>();

    for (const pedido of pedidos) {
      const totalVenta = Number(pedido.totalVenta);
      const costoTotal = Number(pedido.costoTotalPedido);
      const ganancia = Number(pedido.gananciaNeta);

      if (pedido.estado === "PAGADO") {
        ingresosTotales += totalVenta;
        costoProduccion += costoTotal;
        gananciaNeta += ganancia;
        ordenesPagadas++;

        for (const detalle of pedido.detalles) {
          const pId = detalle.productoId;
          const current = productoStats.get(pId) || {
            nombre: detalle.producto.nombre,
            cantidadVendida: 0,
            ingresoGenerado: 0
          };

          current.cantidadVendida += detalle.cantidadVendida;
          current.ingresoGenerado += (Number(detalle.precioVentaHistorico) * detalle.cantidadVendida);
          
          productoStats.set(pId, current);
        }
      } else if (pedido.estado === "ACTIVO" || pedido.estado === "DESPACHADO") {
        dineroPendiente += totalVenta;
      }
    }

    let comprasInsumos = 0;
    let gastosOperativos = 0;

    for (const gasto of gastos) {
      const monto = Number(gasto.montoTotal);
      if (gasto.tipo === "COMPRA_INSUMO") {
        comprasInsumos += monto;
      } else if (gasto.tipo === "OPERATIVO") {
        gastosOperativos += monto;
      }
    }

    const margenPorcentaje = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0;
    const flujoCajaNeto = ingresosTotales - (comprasInsumos + gastosOperativos);

    const bestSellers = Array.from(productoStats.values())
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5);

    return {
      success: true,
      data: {
        ingresosTotales,
        costoProduccion,
        gananciaNeta,
        dineroPendiente,
        margenPorcentaje,
        ordenesPagadas,
        bestSellers,
        comprasInsumos,
        gastosOperativos,
        flujoCajaNeto,
        totalSalidas: comprasInsumos + gastosOperativos
      }
    };

  } catch (error: any) {
    return { success: false, error: "Error al calcular las métricas financieras" };
  }
}
