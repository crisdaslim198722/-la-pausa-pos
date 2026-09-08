"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

interface CartItem {
  productoId: string;
  nombre: string;
  precioVentaActual: number;
  cantidad: number;
}

interface POSCartContextType {
  items: CartItem[];
  addItem: (producto: { id: string; nombre: string; precioVentaActual: number }) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalVenta: number;
}

const POSCartContext = createContext<POSCartContextType | undefined>(undefined);

export function POSCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (producto: { id: string; nombre: string; precioVentaActual: number }) => {
    setItems((current) => {
      const existing = current.find(i => i.productoId === producto.id);
      if (existing) {
        return current.map(i => i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...current, { productoId: producto.id, nombre: producto.nombre, precioVentaActual: producto.precioVentaActual, cantidad: 1 }];
    });
  };

  const removeItem = (productoId: string) => {
    setItems(current => current.filter(i => i.productoId !== productoId));
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }
    setItems(current => current.map(i => i.productoId === productoId ? { ...i, cantidad } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);
  const totalVenta = useMemo(() => items.reduce((sum, item) => sum + (item.cantidad * item.precioVentaActual), 0), [items]);

  return (
    <POSCartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalVenta }}>
      {children}
    </POSCartContext.Provider>
  );
}

export function usePOSCart() {
  const context = useContext(POSCartContext);
  if (!context) throw new Error("usePOSCart must be used within a POSCartProvider");
  return context;
}
