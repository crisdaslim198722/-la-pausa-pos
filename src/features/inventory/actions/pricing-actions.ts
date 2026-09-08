"use server";

import { prisma } from "@/lib/prisma";
import { SetPrecioVentaSchema, SetPrecioVentaInput } from "../schemas/pricing";
import { revalidatePath } from "next/cache";

export async function setPrecioVenta(data: SetPrecioVentaInput) {
  try {
    const validated = SetPrecioVentaSchema.parse(data);

    const producto = await prisma.producto.update({
      where: { id: validated.productoId },
      data: { precioVentaActual: validated.precioVentaActual },
    });

    revalidatePath("/inventario/precios");
    revalidatePath("/productos"); // Por si acaso afecta otras vistas
    return { success: true, data: { id: producto.id, precioVentaActual: Number(producto.precioVentaActual) } };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar el precio de venta" };
  }
}

export async function getPreciosProductosList() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        costoTotal: true,
        precioVentaActual: true,
      }
    });

    const serialized = productos.map(p => ({
      ...p,
      costoTotal: Number(p.costoTotal),
      precioVentaActual: Number(p.precioVentaActual),
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: "Error al cargar la lista de precios" };
  }
}

export async function getPrecioProductoDetail(id: string) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        receta: {
          include: {
            insumo: true
          }
        }
      }
    });

    if (!producto) return { success: false, error: "Producto no encontrado" };

    const serialized = {
      ...producto,
      costoTotal: Number(producto.costoTotal),
      precioVentaActual: Number(producto.precioVentaActual),
      receta: producto.receta.map(r => ({
        ...r,
        cantidad: Number(r.cantidad),
        costoSubtotal: Number(r.costoSubtotal),
        insumo: {
          ...r.insumo,
          unidadMedida: r.insumo.unidadMedida,
        }
      }))
    };

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: "Error al cargar el detalle del producto" };
  }
}
