"use server";

import { prisma } from "@/lib/prisma";
import { CreateProductoSchema, UpdateProductoSchema, CreateProductoInput, UpdateProductoInput } from "../schemas/producto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper para transformar el producto y su receta con números planos
function serializeProducto(producto: any) {
  if (!producto) return null;
  return {
    ...producto,
    costoTotal: Number(producto.costoTotal),
    createdAt: producto.createdAt?.toISOString(),
    updatedAt: producto.updatedAt?.toISOString(),
    receta: producto.receta?.map((item: any) => ({
      ...item,
      cantidad: Number(item.cantidad),
      costoSubtotal: Number(item.costoSubtotal),
      insumo: item.insumo ? {
        ...item.insumo,
        precioCompra: Number(item.insumo.precioCompra),
        rendimientoUnidad: Number(item.insumo.rendimientoUnidad),
        costoUnitario: Number(item.insumo.costoUnitario),
      } : undefined
    }))
  };
}

export async function createProducto(data: CreateProductoInput) {
  try {
    const validatedData = CreateProductoSchema.parse(data);

    // Consultar todos los insumos involucrados para obtener sus costos unitarios vigentes
    const insumosIds = validatedData.insumos.map((i) => i.insumoId);
    const insumosDb = await prisma.insumo.findMany({
      where: { id: { in: insumosIds } },
    });

    if (insumosDb.length !== insumosIds.length) {
      return { success: false, error: "Uno o más insumos seleccionados no existen" };
    }

    // Mapa para búsqueda rápida
    const insumosMap = new Map(insumosDb.map((i) => [i.id, i]));

    let costoTotalCalculado = 0;
    const recetaItems = validatedData.insumos.map((item) => {
      const insumoInfo = insumosMap.get(item.insumoId)!;
      const subtotal = Number(item.cantidad) * Number(insumoInfo.costoUnitario);
      costoTotalCalculado += subtotal;
      
      return {
        insumoId: item.insumoId,
        cantidad: item.cantidad,
        costoSubtotal: Number(subtotal.toFixed(2)),
      };
    });

    costoTotalCalculado = Number(costoTotalCalculado.toFixed(2));

    // Ejecutar en transacción para persistir todo junto
    const newProducto = await prisma.$transaction(async (tx) => {
      return await tx.producto.create({
        data: {
          nombre: validatedData.nombre,
          costoTotal: costoTotalCalculado,
          receta: {
            create: recetaItems,
          },
        },
        include: {
          receta: {
            include: {
              insumo: true
            }
          }
        }
      });
    });

    revalidatePath("/productos");
    revalidatePath("/inventario/precios");
    return { success: true, data: serializeProducto(newProducto) };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "El producto ya existe" };
    }
    return { success: false, error: error.message || "Error al crear el producto" };
  }
}

export async function updateProducto(id: string, data: UpdateProductoInput) {
  try {
    const validatedData = UpdateProductoSchema.parse(data);

    const insumosIds = validatedData.insumos.map((i) => i.insumoId);
    const insumosDb = await prisma.insumo.findMany({
      where: { id: { in: insumosIds } },
    });

    if (insumosDb.length !== insumosIds.length) {
      return { success: false, error: "Uno o más insumos seleccionados no existen" };
    }

    const insumosMap = new Map(insumosDb.map((i) => [i.id, i]));

    let costoTotalCalculado = 0;
    const recetaItems = validatedData.insumos.map((item) => {
      const insumoInfo = insumosMap.get(item.insumoId)!;
      const subtotal = Number(item.cantidad) * Number(insumoInfo.costoUnitario);
      costoTotalCalculado += subtotal;
      
      return {
        insumoId: item.insumoId,
        cantidad: item.cantidad,
        costoSubtotal: Number(subtotal.toFixed(2)),
      };
    });

    costoTotalCalculado = Number(costoTotalCalculado.toFixed(2));

    const updatedProducto = await prisma.$transaction(async (tx) => {
      // Limpiar receta actual
      await tx.recetaItem.deleteMany({
        where: { productoId: id }
      });

      // Actualizar producto y agregar nueva receta
      return await tx.producto.update({
        where: { id },
        data: {
          costoTotal: costoTotalCalculado,
          receta: {
            create: recetaItems,
          }
        },
        include: {
          receta: {
            include: { insumo: true }
          }
        }
      });
    });

    revalidatePath("/productos");
    return { success: true, data: serializeProducto(updatedProducto) };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar el producto" };
  }
}

export async function getProductos() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { receta: true }
        }
      }
    });
    return { success: true, data: productos.map(serializeProducto) };
  } catch (error: any) {
    return { success: false, error: "No se pudo cargar el listado de productos. Intente nuevamente más tarde" };
  }
}

export async function getProductoById(id: string) {
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
    return { success: true, data: serializeProducto(producto) };
  } catch (error: any) {
    return { success: false, error: "Error al cargar el producto" };
  }
}
