"use client";

import { useState } from "react";
import { updateOrderState } from "../actions/update-order";
import toast from "react-hot-toast";
import { CheckCircle2, Coffee, DollarSign, Loader2, X } from "lucide-react";

interface PedidoDetail {
  id: string;
  productoId: string;
  cantidadVendida: number;
  precioVentaHistorico: number;
  costoHistorico: number;
  producto: { nombre: string };
}

interface Pedido {
  id: string;
  nombreCliente: string | null;
  fechaHora: string;
  totalVenta: number;
  costoTotalPedido: number;
  gananciaNeta: number;
  estado: "ACTIVO" | "DESPACHADO" | "PAGADO" | "CANCELADO";
  detalles: PedidoDetail[];
}

interface Props {
  pedidos: Pedido[];
}

export function ActiveOrdersList({ pedidos }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pedidoCobro, setPedidoCobro] = useState<Pedido | null>(null);

  const totalPagadoDia = pedidos.filter(p => p.estado === "PAGADO").reduce((sum, p) => sum + p.totalVenta, 0);

  const handleUpdateState = async (id: string, newState: "ACTIVO" | "DESPACHADO" | "PAGADO") => {
    setLoadingId(id);
    const res = await updateOrderState(id, newState);
    setLoadingId(null);
    
    if (res.success) {
      if (newState === "DESPACHADO") toast.success("Pedido enviado a barra para cobro");
      if (newState === "PAGADO") {
        toast.success("Pago registrado exitosamente");
        setPedidoCobro(null);
      }
    } else {
      toast.error(res.error || "Error al actualizar");
    }
  };

  const activos = pedidos.filter(p => p.estado === "ACTIVO");
  const despachados = pedidos.filter(p => p.estado === "DESPACHADO");
  const pagados = pedidos.filter(p => p.estado === "PAGADO");

  const OrderCard = ({ pedido, isActivo, isDespachado, isPagado }: { pedido: Pedido, isActivo?: boolean, isDespachado?: boolean, isPagado?: boolean }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
        <div>
          <span className="text-xs font-bold text-gray-400">#{pedido.id.split('-')[0].toUpperCase()}</span>
          <h3 className="font-black text-gray-800 text-lg leading-tight mt-1">
            {pedido.nombreCliente || "Cliente Anónimo"}
          </h3>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            {new Date(pedido.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-[#A13E21] text-xl">${pedido.totalVenta.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <ul className="space-y-3">
          {pedido.detalles.map(d => (
            <li key={d.id} className="flex items-center gap-3 text-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F4EEE2] text-[#A13E21] font-black flex items-center justify-center border border-[#A13E21]/20">
                {d.cantidadVendida}x
              </span>
              <span className="font-semibold text-gray-700 capitalize leading-tight">
                {d.producto.nombre}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {isActivo && (
          <button
            onClick={() => handleUpdateState(pedido.id, "DESPACHADO")}
            disabled={loadingId === pedido.id}
            className="w-full py-3 bg-[#B49659] hover:bg-[#a1844b] text-white rounded-lg font-bold flex justify-center items-center gap-2 transition"
          >
            {loadingId === pedido.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Coffee className="w-5 h-5" /> Marcar Despachado</>}
          </button>
        )}
        {isDespachado && (
          <button
            onClick={() => setPedidoCobro(pedido)}
            disabled={loadingId === pedido.id}
            className="w-full py-3 bg-[#A13E21] hover:bg-[#8b341c] text-white rounded-lg font-bold flex justify-center items-center gap-2 transition"
          >
            {loadingId === pedido.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><DollarSign className="w-5 h-5" /> Cobrar Pedido</>}
          </button>
        )}
        {isPagado && (
          <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-bold flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Pagado
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white text-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingresos Caja Hoy</h2>
            <p className="text-4xl font-black text-green-600">${totalPagadoDia.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Órdenes Pagadas</p>
            <p className="text-3xl font-black">{pagados.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Columna 1: En Preparación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-yellow-400 pb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <h2 className="font-bold text-gray-700">En Preparación ({activos.length})</h2>
            </div>
            {activos.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay pedidos pendientes</p>}
            <div className="flex flex-col gap-4">
              {activos.map(p => <OrderCard key={p.id} pedido={p} isActivo />)}
            </div>
          </div>

          {/* Columna 2: Por Cobrar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-orange-500 pb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h2 className="font-bold text-gray-700">Por Cobrar ({despachados.length})</h2>
            </div>
            {despachados.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay cobros pendientes</p>}
            <div className="flex flex-col gap-4">
              {despachados.map(p => <OrderCard key={p.id} pedido={p} isDespachado />)}
            </div>
          </div>

          {/* Columna 3: Pagados */}
          <div className="space-y-4 opacity-70">
            <div className="flex items-center gap-2 border-b-2 border-green-500 pb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h2 className="font-bold text-gray-700">Pagados Recientes ({pagados.length})</h2>
            </div>
            <div className="flex flex-col gap-4">
              {pagados.slice(0, 10).map(p => <OrderCard key={p.id} pedido={p} isPagado />)}
            </div>
          </div>

        </div>
      </div>

      {/* Pop-up de Cobro */}
      {pedidoCobro && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-xl">
            <button 
              onClick={() => setPedidoCobro(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 font-bold uppercase mb-1">Total a Cobrar</p>
              <p className="text-5xl font-black text-[#A13E21]">${pedidoCobro.totalVenta.toFixed(2)}</p>
              <p className="text-sm font-bold text-gray-800 mt-2">
                Cliente: {pedidoCobro.nombreCliente || "Anónimo"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto border border-gray-100">
              <ul className="space-y-2">
                {pedidoCobro.detalles.map(d => (
                  <li key={d.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{d.cantidadVendida}x {d.producto.nombre}</span>
                    <span className="font-bold text-gray-800">${(d.precioVentaHistorico * d.cantidadVendida).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpdateState(pedidoCobro.id, "PAGADO")}
              disabled={loadingId === pedidoCobro.id}
              className="w-full bg-green-600 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-transform"
            >
              {loadingId === pedidoCobro.id ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar Pago Recibido"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
