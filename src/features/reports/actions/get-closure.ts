"use server";

import { prisma } from "@/lib/prisma";

export async function getFinancialMetrics(startDateStr?: string, endDateStr?: string) {
  try {
    // 1. Resolver rangos de fecha
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

    // 2. Obtener pedidos en el rango
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

    // 3. Inicializar Métricas
    let ingresosTotales = 0;
    let costoProduccion = 0;
    let gananciaNeta = 0;
    let dineroPendiente = 0; // Dinero en estado ACTIVO o DESPACHADO
    let ordenesPagadas = 0;

    // 4. Mapa para Best Sellers
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

        // Contar productos vendidos solo de órdenes pagadas
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

    // Calcular Margen Promedio
    const margenPorcentaje = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0;

    // Ordenar Best Sellers
    const bestSellers = Array.from(productoStats.values())
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida) // Ordenar por cantidad (descendente)
      .slice(0, 5); // Top 5

    return {
      success: true,
      data: {
        ingresosTotales,
        costoProduccion,
        gananciaNeta,
        dineroPendiente,
        margenPorcentaje,
        ordenesPagadas,
        bestSellers
      }
    };

  } catch (error: any) {
    return { success: false, error: "Error al calcular las métricas financieras" };
  }
}
