"use client";

import { useState } from "react";
import { createInsumoPurchaseTransaction, createOperativeExpense } from "../actions/expense-actions";
import toast from "react-hot-toast";
import { PackageSearch, Receipt, Loader2 } from "lucide-react";

interface InsumoOption {
  id: string;
  nombre: string;
  unidadCompra: string;
}

export function ExpenseForms({ insumos }: { insumos: InsumoOption[] }) {
  const [tab, setTab] = useState<"INSUMO" | "OPERATIVO">("INSUMO");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("INSUMO")}
          className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
            tab === "INSUMO" ? "bg-[#e8f0eb] text-[#3e664f] border-b-2 border-[#3e664f]" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <PackageSearch className="w-5 h-5" /> Ingresar Insumo
        </button>
        <button
          onClick={() => setTab("OPERATIVO")}
          className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
            tab === "OPERATIVO" ? "bg-[#F4EEE2] text-[#A13E21] border-b-2 border-[#A13E21]" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Receipt className="w-5 h-5" /> Gasto Operativo
        </button>
      </div>

      <div className="p-6">
        {tab === "INSUMO" ? <InsumoForm insumos={insumos} /> : <OperativeForm />}
      </div>
    </div>
  );
}

function InsumoForm({ insumos }: { insumos: InsumoOption[] }) {
  const [insumoId, setInsumoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [monto, setMonto] = useState("");
  const [actualizarCosto, setActualizarCosto] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedInsumo = insumos.find(i => i.id === insumoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoId || !cantidad || !monto) return toast.error("Completa todos los campos");

    setLoading(true);
    const res = await createInsumoPurchaseTransaction({
      insumoId,
      cantidadComprada: Number(cantidad),
      montoTotal: Number(monto),
      actualizarCosto
    });
    setLoading(false);

    if (res.success) {
      toast.success("Inventario actualizado correctamente");
      setInsumoId("");
      setCantidad("");
      setMonto("");
      setActualizarCosto(false);
    } else {
      toast.error(res.error || "Error al registrar la compra");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Insumo Comprado</label>
        <select
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:border-[#3e664f] outline-none"
        >
          <option value="">Selecciona un insumo...</option>
          {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Cantidad {selectedInsumo && <span className="text-[#3e664f]">({selectedInsumo.unidadCompra})</span>}
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            disabled={!insumoId}
            placeholder="Ej. 2"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#3e664f] outline-none disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Monto Pagado ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej. 15000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#3e664f] outline-none"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
        <input 
          type="checkbox" 
          checked={actualizarCosto}
          onChange={(e) => setActualizarCosto(e.target.checked)}
          className="mt-1 w-5 h-5 text-[#3e664f] rounded border-gray-300 focus:ring-[#3e664f]"
        />
        <div>
          <p className="font-bold text-gray-800">Actualizar costo en el catálogo</p>
          <p className="text-sm text-gray-500 leading-snug">
            Al marcar esto, el precio oficial del insumo cambiará a lo que pagaste hoy, recalculando automáticamente el costo de las recetas que lo usan.
          </p>
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3e664f] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2c4c3b] transition disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar e Inyectar Stock"}
      </button>
    </form>
  );
}

function OperativeForm() {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || !monto) return toast.error("Completa todos los campos");

    setLoading(true);
    const res = await createOperativeExpense({
      descripcion,
      montoTotal: Number(monto)
    });
    setLoading(false);

    if (res.success) {
      toast.success("Gasto registrado");
      setDescripcion("");
      setMonto("");
    } else {
      toast.error(res.error || "Error al registrar el gasto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción del Gasto</label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej. Recibo de luz, Arriendo, Empaques"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#A13E21] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Monto Pagado ($)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Ej. 45000"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#A13E21] outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#A13E21] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8b341c] transition disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Salida de Dinero"}
      </button>
    </form>
  );
}
