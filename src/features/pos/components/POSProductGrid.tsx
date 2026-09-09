"use client";

import { usePOSCart } from "./POSCartContext";
import { formatCurrency } from "@/lib/format";

interface ProductoBase {
  id: string;
  nombre: string;
  precioVentaActual: number;
}

interface Props {
  productos: ProductoBase[];
}

export function POSProductGrid({ productos }: Props) {
  const { items, addItem, updateQuantity } = usePOSCart();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-32">
      {productos.map(p => {
        const cartItem = items.find(i => i.productoId === p.id);
        const qty = cartItem?.cantidad || 0;
        const isAvailable = p.precioVentaActual > 0;

        return (
          <div 
            key={p.id} 
            className={`flex flex-col justify-between p-4 rounded-xl border-2 transition-all ${
              !isAvailable 
                ? "bg-gray-100 border-gray-200 opacity-60" 
                : qty > 0 
                  ? "bg-[#F4EEE2] border-[#A13E21] shadow-md" 
                  : "bg-white border-[#B49659]/30 hover:border-[#B49659]"
            }`}
          >
            <div className="mb-4">
              <h3 className="font-bold text-[#6E6C41] leading-tight mb-1">{p.nombre}</h3>
              {isAvailable ? (
                <p className="font-semibold text-[#A13E21]">{formatCurrency(p.precioVentaActual)}</p>
              ) : (
                <p className="text-xs font-bold text-gray-500 uppercase">Sin Precio</p>
              )}
            </div>

            {isAvailable && (
              <div className="mt-auto">
                {qty === 0 ? (
                  <button
                    onClick={() => addItem(p)}
                    className="w-full py-2 bg-[#B49659] text-white rounded-lg font-bold text-sm active:scale-95 transition-transform"
                  >
                    Agregar
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-white rounded-lg overflow-hidden border border-[#A13E21]">
                    <button 
                      onClick={() => updateQuantity(p.id, qty - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-[#F4EEE2] text-[#A13E21] font-bold text-lg active:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="font-bold text-[#A13E21]">{qty}</span>
                    <button 
                      onClick={() => updateQuantity(p.id, qty + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-[#F4EEE2] text-[#A13E21] font-bold text-lg active:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
