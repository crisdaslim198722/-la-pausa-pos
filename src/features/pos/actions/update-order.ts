"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type PedidoEstado = "ACTIVO" | "DESPACHADO" | "PAGADO" | "CANCELADO";

export async function updateOrderState(id: string, estado: PedidoEstado) {
  try {
    await prisma.pedido.update({
      where: { id },
      data: { estado }
    });

    revalidatePath("/pos/ordenes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar el estado del pedido" };
  }
}
