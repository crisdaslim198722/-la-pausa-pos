"use server";

import { prisma } from "@/lib/prisma";
import { CreateInsumoSchema, UpdateInsumoSchema, CreateInsumoInput, UpdateInsumoInput } from "../schemas/insumo";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper para transformar objetos Decimal de Prisma a números puros
// Esto evita el error de Next.js: "Only plain objects can be passed to Client Components from Server Components"
function serializeInsumo(insumo: any) {
  return {
    ...insumo,
    precioCompra: Number(insumo.precioCompra),
    rendimientoUnidad: Number(insumo.rendimientoUnidad),
    costoUnitario: Number(insumo.costoUnitario),
    cantidadDisponible: insumo.cantidadDisponible ? Number(insumo.cantidadDisponible) : 0,
    createdAt: insumo.createdAt.toISOString(),
    updatedAt: insumo.updatedAt.toISOString(),
  };
}

export async function createInsumo(data: CreateInsumoInput) {
  try {
    const validatedData = CreateInsumoSchema.parse(data);

    // Calculate costoUnitario: precioCompra / rendimientoUnidad
    const costoUnitario = Number((validatedData.precioCompra / validatedData.rendimientoUnidad).toFixed(2));

    const newInsumo = await prisma.insumo.create({
      data: {
        nombre: validatedData.nombre,
        unidadCompra: validatedData.unidadCompra,
        precioCompra: validatedData.precioCompra,
        rendimientoUnidad: validatedData.rendimientoUnidad,
        unidadMedida: validatedData.unidadMedida,
        costoUnitario,
      },
    });

    revalidatePath("/inventario/insumos");
    return { success: true, data: serializeInsumo(newInsumo) };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "El insumo ya existe" };
    }
    return { success: false, error: error.message || "Error al crear el insumo" };
  }
}

export async function updateInsumo(id: string, data: UpdateInsumoInput) {
  try {
    const validatedData = UpdateInsumoSchema.parse(data);

    const costoUnitario = Number((validatedData.precioCompra / validatedData.rendimientoUnidad).toFixed(2));

    const updatedInsumo = await prisma.insumo.update({
      where: { id },
      data: {
        unidadCompra: validatedData.unidadCompra,
        precioCompra: validatedData.precioCompra,
        rendimientoUnidad: validatedData.rendimientoUnidad,
        unidadMedida: validatedData.unidadMedida,
        costoUnitario,
      },
    });

    revalidatePath("/inventario/insumos");
    return { success: true, data: serializeInsumo(updatedInsumo) };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar el insumo" };
  }
}

export async function getInsumos() {
  try {
    const insumos = await prisma.insumo.findMany({
      orderBy: { nombre: "asc" },
    });
    return { success: true, data: insumos.map(serializeInsumo) };
  } catch (error: any) {
    return { success: false, error: "No se pudo cargar el listado de insumos. Intente nuevamente más tarde" };
  }
}

export async function deleteInsumo(id: string) {
  try {
    // Aquí el spec menciona: verificar dependencias en RecetaItem antes de eliminar.
    // Como RecetaItem aún no existe, dejamos el borrado simple. 
    // Cuando exista la relación, Prisma lanzará un P2003 (Foreign key constraint failed).
    await prisma.insumo.delete({
      where: { id },
    });

    revalidatePath("/inventario/insumos");
    return { success: true };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: "No se puede eliminar un insumo asociado a una receta" };
    }
    return { success: false, error: "Error al eliminar el insumo" };
  }
}

export async function getInsumoById(id: string) {
    try {
        const insumo = await prisma.insumo.findUnique({ where: { id } });
        if (!insumo) return { success: false, error: "Insumo no encontrado" };
        return { success: true, data: serializeInsumo(insumo) };
    } catch(error) {
        return { success: false, error: "Error al cargar el insumo" };
    }
}
