"use server";

import { prisma } from "@/lib/prisma";
import { CreateInsumoPurchaseSchema, CreateOperativeExpenseSchema } from "../schemas/expense";
import { revalidatePath } from "next/cache";

export async function createOperativeExpense(data: { descripcion: string; montoTotal: number }) {
  try {
    const valid = CreateOperativeExpenseSchema.parse(data);

    await prisma.gasto.create({
      data: {
        tipo: "OPERATIVO",
        descripcion: valid.descripcion,
        montoTotal: valid.montoTotal,
      }
    });

    revalidatePath("/gastos");
    revalidatePath("/reportes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al registrar el gasto operativo" };
  }
}

export async function createInsumoPurchaseTransaction(data: {
  insumoId: string;
  cantidadComprada: number;
  montoTotal: number;
  actualizarCosto: boolean;
}) {
  try {
    const valid = CreateInsumoPurchaseSchema.parse(data);

    await prisma.$transaction(async (tx) => {
      // 1. Obtener el insumo actual
      const insumo = await tx.insumo.findUnique({
        where: { id: valid.insumoId }
      });
      if (!insumo) throw new Error("Insumo no encontrado");

      const rend = Number(insumo.rendimientoUnidad) || 1; // Fallback a 1 si por algún error viejo era 0
      // La cantidad comprada ahora representa EMPAQUES. Lo multiplicamos por su rendimiento para inyectar al stock.
      const injectedAmount = valid.cantidadComprada * rend;

      if (injectedAmount <= 0) {
        throw new Error("El rendimiento o cantidad comprada es inválido (menor o igual a cero). Por favor revisa el catálogo.");
      }

      // 2. Crear el Gasto
      await tx.gasto.create({
        data: {
          tipo: "COMPRA_INSUMO",
          descripcion: `Compra de inventario: ${insumo.nombre}`,
          montoTotal: valid.montoTotal,
          insumoId: valid.insumoId,
          // Guardamos cuántos empaques compró
          cantidadComprada: valid.cantidadComprada,
        }
      });

      // 3. Preparar nueva info del Insumo
      const newCantidadDisponible = Number(insumo.cantidadDisponible) + injectedAmount;
      let newPrecioCompra = Number(insumo.precioCompra) || 0;
      let newCostoUnitario = Number(insumo.costoUnitario) || 0;

      if (valid.actualizarCosto) {
        // Costo exacto por unidad de medida (ej. por 1 gramo)
        const calcCosto = valid.montoTotal / injectedAmount;
        newCostoUnitario = isNaN(calcCosto) || !isFinite(calcCosto) ? 0 : Number(calcCosto.toFixed(2));
        
        const calcPrecio = valid.montoTotal / valid.cantidadComprada;
        newPrecioCompra = isNaN(calcPrecio) || !isFinite(calcPrecio) ? 0 : Number(calcPrecio.toFixed(2));
      }

      // 4. Actualizar el insumo
      await tx.insumo.update({
        where: { id: valid.insumoId },
        data: {
          cantidadDisponible: newCantidadDisponible,
          precioCompra: newPrecioCompra,
          costoUnitario: newCostoUnitario
        }
      });

      // 5. Cascada de costos si el costo fue actualizado
      if (valid.actualizarCosto && newCostoUnitario !== Number(insumo.costoUnitario)) {
        const affectedItems = await tx.recetaItem.findMany({
          where: { insumoId: valid.insumoId }
        });

        if (affectedItems.length > 0) {
          for (const item of affectedItems) {
            const newSubtotal = Number((Number(item.cantidad) * newCostoUnitario).toFixed(2));
            await tx.recetaItem.update({
              where: { id: item.id },
              data: { costoSubtotal: newSubtotal }
            });
          }

          const productIds = [...new Set(affectedItems.map(i => i.productoId))];
          for (const pid of productIds) {
            const allItems = await tx.recetaItem.findMany({
              where: { productoId: pid }
            });
            const newTotal = allItems.reduce((acc, curr) => acc + Number(curr.costoSubtotal), 0);
            await tx.producto.update({
              where: { id: pid },
              data: { costoTotal: Number(newTotal.toFixed(2)) }
            });
          }
        }
      }
    });

    revalidatePath("/gastos");
    revalidatePath("/inventario/insumos");
    revalidatePath("/productos");
    revalidatePath("/reportes");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al procesar la compra de insumo" };
  }
}

export async function getGastos(startDate?: string, endDate?: string) {
  try {
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.fechaHora = {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const gastos = await prisma.gasto.findMany({
      where: whereClause,
      orderBy: { fechaHora: "desc" },
      include: {
        insumo: { select: { nombre: true, unidadCompra: true } }
      }
    });

    const serialized = gastos.map((g: any) => ({
      id: g.id,
      tipo: g.tipo,
      descripcion: g.descripcion,
      montoTotal: Number(g.montoTotal),
      fechaHora: g.fechaHora.toISOString(),
      insumoId: g.insumoId,
      insumoNombre: g.insumo?.nombre || null,
      unidadCompra: g.insumo?.unidadCompra || null,
      cantidadComprada: g.cantidadComprada ? Number(g.cantidadComprada) : null,
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: "Error al obtener los gastos" };
  }
}
