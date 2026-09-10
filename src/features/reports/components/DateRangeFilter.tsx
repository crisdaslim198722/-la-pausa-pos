"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Calendar, Loader2 } from "lucide-react";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialStart = searchParams.get("start") || new Date().toISOString().split('T')[0];
  const initialEnd = searchParams.get("end") || new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  
  const [isPending, startTransition] = useTransition();

  // Sync state if URL changes externally
  useEffect(() => {
    setStartDate(searchParams.get("start") || new Date().toISOString().split('T')[0]);
    setEndDate(searchParams.get("end") || new Date().toISOString().split('T')[0]);
  }, [searchParams]);

  const applyDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    startTransition(() => {
      router.push(`${pathname}?start=${start}&end=${end}`);
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyDates(startDate, endDate);
  };

  const getPresetDates = (daysAgoStart: number, daysAgoEnd: number = 0) => {
    const today = new Date();
    
    const end = new Date(today);
    end.setDate(today.getDate() - daysAgoEnd);
    
    const start = new Date(today);
    start.setDate(today.getDate() - daysAgoStart);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const setPreset = (daysAgoStart: number, daysAgoEnd: number = 0) => {
    const { start, end } = getPresetDates(daysAgoStart, daysAgoEnd);
    applyDates(start, end);
  };

  const isPresetActive = (daysAgoStart: number, daysAgoEnd: number = 0) => {
    const { start, end } = getPresetDates(daysAgoStart, daysAgoEnd);
    return startDate === start && endDate === end;
  };

  const getButtonClass = (active: boolean) => {
    return active
      ? "px-4 py-2 bg-[#F4EEE2] text-[#A13E21] font-bold text-sm rounded-lg transition border border-[#A13E21]/20"
      : "px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-lg transition border border-transparent";
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-[#A13E21] font-bold text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setPreset(0)}
          className={getButtonClass(isPresetActive(0))}
        >
          Hoy
        </button>
        <button 
          onClick={() => setPreset(1, 1)}
          className={getButtonClass(isPresetActive(1, 1))}
        >
          Ayer
        </button>
        <button 
          onClick={() => setPreset(7)}
          className={getButtonClass(isPresetActive(7))}
        >
          Últimos 7 Días
        </button>
        <button 
          onClick={() => setPreset(30)}
          className={getButtonClass(isPresetActive(30))}
        >
          Últimos 30 Días
        </button>
      </div>

      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A13E21]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
          <input 
            type="date" 
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A13E21]"
          />
        </div>
        <button 
          type="submit"
          className="bg-[#A13E21] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#8b341c] flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Filtrar
        </button>
      </form>
    </div>
  );
}
