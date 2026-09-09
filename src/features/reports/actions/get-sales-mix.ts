"use server";

import { prisma } from "@/lib/prisma";

export interface SalesMixItem {
  productoId: string;
  nombre: string;
  unidadesVendidas: number;
  ventasTotales: number;
  margenHistoricoPromedio: number;
  participacionVentas: number; // 0 to 100
  aporteGlobal: number; // 0 to 100
}

export interface SalesMixReport {
  ventasTotalesPeriodo: number;
  margenGlobalPonderado: number;
  items: SalesMixItem[];
}

export async function getSalesMix(
  startDateStr?: string,
  endDateStr?: string
): Promise<{ success: boolean; data?: SalesMixReport; error?: string }> {
  try {
    let start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (startDateStr) {
      const parsedStart = new Date(startDateStr);
      if (!isNaN(parsedStart.getTime())) {
        parsedStart.setHours(0, 0, 0, 0);
        start = parsedStart;
      }
    }

    if (endDateStr) {
      const parsedEnd = new Date(endDateStr);
      if (!isNaN(parsedEnd.getTime())) {
        parsedEnd.setHours(23, 59, 59, 999);
        end = parsedEnd;
      }
    }

    // Traer todos los detalles de los pedidos PAGADOS en el rango
    const detalles = await prisma.detallePedido.findMany({
      where: {
        pedido: {
          estado: "PAGADO",
          fechaHora: { gte: start, lte: end }
        }
      },
      include: {
        producto: { select: { nombre: true } }
      }
    });

    if (detalles.length === 0) {
      return {
        success: true,
        data: { ventasTotalesPeriodo: 0, margenGlobalPonderado: 0, items: [] }
      };
    }

    // 1. Agrupar por producto y sumar ventas totales del negocio
    let ventasTotalesNegocio = 0;
    const prodMap = new Map<string, {
      nombre: string;
      unidades: number;
      ventas: number;
      sumatoriaCostos: number; // para calcular margen promedio
    }>();

    for (const d of detalles) {
      const pVenta = Number(d.precioVentaHistorico);
      const pCosto = Number(d.costoHistorico);
      const qty = d.cantidadVendida;
      
      const ventaItem = pVenta * qty;
      const costoItem = pCosto * qty;
      
      ventasTotalesNegocio += ventaItem;

      if (!prodMap.has(d.productoId)) {
        prodMap.set(d.productoId, { nombre: d.producto.nombre, unidades: 0, ventas: 0, sumatoriaCostos: 0 });
      }

      const entry = prodMap.get(d.productoId)!;
      entry.unidades += qty;
      entry.ventas += ventaItem;
      entry.sumatoriaCostos += costoItem;
    }

    if (ventasTotalesNegocio === 0) {
      return { success: true, data: { ventasTotalesPeriodo: 0, margenGlobalPonderado: 0, items: [] } };
    }

    // 2. Calcular participaciones, márgenes y aportes
    const items: SalesMixItem[] = [];
    let margenGlobalPonderado = 0;

    for (const [id, data] of Array.from(prodMap.entries())) {
      const participacionVentas = (data.ventas / ventasTotalesNegocio) * 100;
      
      // Margen Bruto = ((Ventas - Costos) / Ventas) * 100
      let margenHistoricoPromedio = 0;
      if (data.ventas > 0) {
        margenHistoricoPromedio = ((data.ventas - data.sumatoriaCostos) / data.ventas) * 100;
      }

      const aporteGlobal = (participacionVentas / 100) * margenHistoricoPromedio;

      margenGlobalPonderado += aporteGlobal;

      items.push({
        productoId: id,
        nombre: data.nombre,
        unidadesVendidas: data.unidades,
        ventasTotales: data.ventas,
        margenHistoricoPromedio,
        participacionVentas,
        aporteGlobal
      });
    }

    // Ordenar de mayor a menor aporte
    items.sort((a, b) => b.aporteGlobal - a.aporteGlobal);

    return {
      success: true,
      data: {
        ventasTotalesPeriodo: ventasTotalesNegocio,
        margenGlobalPonderado,
        items
      }
    };

  } catch (error: any) {
    return { success: false, error: "Error al calcular el mix de ventas" };
  }
}
