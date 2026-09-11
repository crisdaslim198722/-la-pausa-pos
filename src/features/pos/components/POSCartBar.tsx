"use client";

import { useState } from "react";
import { usePOSCart } from "./POSCartContext";
import { createOrderTransaction } from "../actions/create-order";
import toast from "react-hot-toast";
import { ShoppingBag, X, Check, Search, Coffee, Loader2, ShoppingCart, Trash2, CheckCircle, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function POSCartBar() {
  const { items, totalItems, totalVenta, clearCart } = usePOSCart();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");

  if (totalItems === 0) return null;

  const handleCheckout = async () => {
    setLoading(true);
    const res = await createOrderTransaction({
      nombreCliente: nombreCliente.trim() || undefined,
      items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
    });
    setLoading(false);

    if (res.success) {
      toast.success("Pedido creado exitosamente");
      clearCart();
      setShowModal(false);
      setNombreCliente("");
    } else {
      toast.error(res.error || "Error al procesar el pedido");
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
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
            onClick={() => setShowModal(true)}
            className="flex-1 max-w-xs bg-[#A13E21] text-white h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Crear Pedido
          </button>
        </div>
      </div>

      {/* Modal Confirmación Pedido */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-black text-[#A13E21] mb-2">Confirmar Pedido</h2>
            <p className="text-sm text-gray-500 mb-6">Total a cobrar: <strong className="text-lg">${totalVenta.toFixed(2)}</strong></p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre del Cliente (Opcional)
                </label>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#A13E21] focus:ring-1 focus:ring-[#A13E21] outline-none transition"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#A13E21] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enviar a Preparación"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
