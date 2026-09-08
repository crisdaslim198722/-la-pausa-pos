"use client";

import { useState } from "react";
import { usePOSCart } from "./POSCartContext";
import { createOrderTransaction } from "../actions/create-order";
import toast from "react-hot-toast";
import { ShoppingBag, Loader2 } from "lucide-react";

export function POSCartBar() {
  const { items, totalItems, totalVenta, clearCart } = usePOSCart();
  const [loading, setLoading] = useState(false);

  if (totalItems === 0) return null;

  const handleCheckout = async () => {
    setLoading(true);
    const res = await createOrderTransaction({
      items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
    });
    setLoading(false);

    if (res.success) {
      toast.success("Pedido creado exitosamente");
      clearCart();
    } else {
      toast.error(res.error || "Error al procesar el pedido");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
      <div className="max-w-3xl mx-auto p-4 px-6 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
          </span>
          <span className="text-2xl font-black text-[#A13E21]">
            ${totalVenta.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1 max-w-xs bg-[#A13E21] text-white h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Cobrar Pedido"}
        </button>
      </div>
    </div>
  );
}
