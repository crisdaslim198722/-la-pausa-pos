"use client";

import { useState } from "react";
import { updateOrderState } from "../actions/update-order";
import { cancelOrder } from "../actions/cancel-order";
import { usePOSCart } from "./POSCartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChefHat, Check, DollarSign, Clock, Loader2, X, CheckCircle2, Coffee, MapPin, Receipt, Trash2, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface PedidoDetail {
  id: string;
  productoId: string;
  cantidadVendida: number;
  precioVentaHistorico: number;
  costoHistorico: number;
  despachado: boolean;
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
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  
  const { setEditingOrderId, setEditingOrderName } = usePOSCart();
  const router = useRouter();

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

  const handleCancelOrder = async (id: string) => {
    setLoadingId(id);
    const res = await cancelOrder(id);
    setLoadingId(null);
    
    if (res.success) {
      toast.success("Pedido cancelado y stock devuelto");
      setCancelModalId(null);
    } else {
      toast.error(res.error || "Error al cancelar");
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
        <div className="text-right flex flex-col items-end">
          <p className="font-black text-[#A13E21] text-xl">{formatCurrency(Number(pedido.totalVenta))}</p>
          {(isActivo || isDespachado) && (
            <button 
              onClick={() => {
                setEditingOrderId(pedido.id);
                setEditingOrderName(pedido.nombreCliente || "Anónimo");
                router.push('/pos');
              }}
              className="mt-2 text-xs font-bold text-[#B49659] hover:text-[#8a7243] flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3" /> Agregar
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <ul className="space-y-3">
          {pedido.detalles.map(d => (
            <li 
              key={d.id} 
              className={`flex items-center gap-3 text-sm p-2 -mx-2 rounded-lg transition-colors ${d.despachado ? 'opacity-60 bg-gray-50/50' : 'bg-orange-50/30 border border-orange-100/50'}`}
            >
              <span className={`flex-shrink-0 w-8 h-8 rounded-full font-black flex items-center justify-center border ${d.despachado ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-[#F4EEE2] text-[#A13E21] border-[#A13E21]/20 shadow-sm'}`}>
                {d.cantidadVendida}x
              </span>
              <span className={`font-bold capitalize leading-tight flex-1 ${d.despachado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {d.producto.nombre}
              </span>
              {d.despachado ? (
                <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-md shadow-sm border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Listo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-md shadow-sm border border-orange-200">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Prep</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
        {isActivo && (
          <div className="flex gap-2">
            <button
              onClick={() => setCancelModalId(pedido.id)}
              disabled={loadingId === pedido.id}
              className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Cancelar Pedido"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleUpdateState(pedido.id, "DESPACHADO")}
              disabled={loadingId === pedido.id}
              className="flex-1 py-3 bg-[#B49659] hover:bg-[#a1844b] text-white rounded-lg font-bold flex justify-center items-center gap-2 transition"
            >
              {loadingId === pedido.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Coffee className="w-5 h-5" /> Marcar Despachado</>}
            </button>
          </div>
        )}

        {isDespachado && (
          <button
            onClick={() => setPedidoCobro(pedido)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex justify-center items-center gap-2 transition"
          >
            <DollarSign className="w-5 h-5" /> Cobrar Pedido
          </button>
        )}

        {isPagado && (
          <div className="flex justify-between items-center text-sm font-bold text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Entregado</span>
            <span>Pagado</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-xl font-black text-gray-800">En Preparación ({activos.length})</h2>
          </div>
          <div className="space-y-4">
            {activos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No hay órdenes pendientes</p>
            ) : (
              activos.map(p => <OrderCard key={p.id} pedido={p} isActivo />)
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-gray-800">Barra / Por Cobrar ({despachados.length})</h2>
          </div>
          <div className="space-y-4">
            {despachados.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">No hay órdenes en barra</p>
            ) : (
              despachados.map(p => <OrderCard key={p.id} pedido={p} isDespachado />)
            )}
          </div>
        </div>

        <div>
          <div className="bg-white text-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingresos Caja Hoy</h2>
              <p className="text-4xl font-black text-green-600">{formatCurrency(Number(totalPagadoDia))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Órdenes Pagadas</p>
              <p className="text-4xl font-black text-gray-800">{pagados.length}</p>
            </div>
          </div>
        </div>
      </div>

      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
            <h2 className="text-xl font-black text-red-600 mb-2">¿Cancelar Pedido?</h2>
            <p className="text-sm text-gray-600 mb-6">Esta acción es irreversible y devolverá los insumos consumidos al inventario.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCancelModalId(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handleCancelOrder(cancelModalId)}
                disabled={loadingId === cancelModalId}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl flex justify-center items-center gap-2"
              >
                {loadingId === cancelModalId ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoCobro && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <button 
              onClick={() => setPedidoCobro(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 font-bold uppercase mb-1">Total a Cobrar</p>
              <p className="text-5xl font-black text-[#A13E21]">{formatCurrency(Number(pedidoCobro.totalVenta))}</p>
              <p className="text-sm font-bold text-gray-800 mt-2">
                Cliente: {pedidoCobro.nombreCliente || "Anónimo"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Resumen del Pedido</h4>
              <ul className="space-y-2">
                {pedidoCobro.detalles.map(d => (
                  <li key={d.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{d.cantidadVendida}x {d.producto.nombre}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(Number(d.precioVentaHistorico) * Number(d.cantidadVendida))}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpdateState(pedidoCobro.id, "PAGADO")}
              disabled={loadingId === pedidoCobro.id}
              className="w-full bg-green-600 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loadingId === pedidoCobro.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Confirmar Pago</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
