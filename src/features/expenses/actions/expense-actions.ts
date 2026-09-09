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

      const rend = Number(insumo.rendimientoUnidad);
      // La cantidad comprada ahora se interpreta directamente en la unidadMedida (ej. gramos)
      const injectedAmount = valid.cantidadComprada; 

      // 2. Crear el Gasto
      await tx.gasto.create({
        data: {
          tipo: "COMPRA_INSUMO",
          descripcion: `Compra de inventario: ${insumo.nombre}`,
          montoTotal: valid.montoTotal,
          insumoId: valid.insumoId,
          // Guardamos lo que inyectó
          cantidadComprada: valid.cantidadComprada,
        }
      });

      // 3. Preparar nueva info del Insumo
      const newCantidadDisponible = Number(insumo.cantidadDisponible) + injectedAmount;
      let newPrecioCompra = Number(insumo.precioCompra);
      let newCostoUnitario = Number(insumo.costoUnitario);

      if (valid.actualizarCosto) {
        // Costo exacto por unidad de medida (ej. por 1 gramo)
        newCostoUnitario = Number((valid.montoTotal / injectedAmount).toFixed(2));
        // Para que coincida con su configuración original, el precio del "lote" será costo unitario * rendimiento
        newPrecioCompra = Number((newCostoUnitario * rend).toFixed(2));
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

export async function getGastos() {
  try {
    const gastos = await prisma.gasto.findMany({
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
