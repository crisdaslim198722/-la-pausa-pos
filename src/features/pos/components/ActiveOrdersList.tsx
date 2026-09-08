"use client";

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
  fechaHora: string;
  totalVenta: number;
  costoTotalPedido: number;
  gananciaNeta: number;
  estado: "ACTIVO" | "CANCELADO";
  detalles: PedidoDetail[];
}

interface Props {
  pedidos: Pedido[];
}

export function ActiveOrdersList({ pedidos }: Props) {
  const totalDia = pedidos.reduce((sum, p) => sum + p.totalVenta, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#A13E21] text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold opacity-80 uppercase tracking-widest">Total Vendido Hoy</h2>
          <p className="text-4xl font-black">${totalDia.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Órdenes</p>
          <p className="text-4xl font-black">{pedidos.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            Aún no hay pedidos registrados en este turno.
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-xl border border-[#B49659]/30 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-500">
                    ID: {pedido.id.split('-')[0].toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold text-[#6E6C41]">
                    {new Date(pedido.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#A13E21] text-lg">${pedido.totalVenta.toFixed(2)}</p>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase">
                    {pedido.estado}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {pedido.detalles.map(d => (
                    <li key={d.id} className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">
                        <span className="text-gray-400 mr-2">{d.cantidadVendida}x</span>
                        {d.producto.nombre}
                      </span>
                      <span className="text-gray-600">
                        ${(d.precioVentaHistorico * d.cantidadVendida).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
