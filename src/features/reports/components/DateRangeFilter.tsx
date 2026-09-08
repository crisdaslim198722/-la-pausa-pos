"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialStart = searchParams.get("start") || new Date().toISOString().split('T')[0];
  const initialEnd = searchParams.get("end") || new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  // Sync state if URL changes externally
  useEffect(() => {
    setStartDate(searchParams.get("start") || new Date().toISOString().split('T')[0]);
    setEndDate(searchParams.get("end") || new Date().toISOString().split('T')[0]);
  }, [searchParams]);

  const applyDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    router.push(`/reportes?start=${start}&end=${end}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyDates(startDate, endDate);
  };

  const setPreset = (daysAgoStart: number, daysAgoEnd: number = 0) => {
    const today = new Date();
    
    const end = new Date(today);
    end.setDate(today.getDate() - daysAgoEnd);
    
    const start = new Date(today);
    start.setDate(today.getDate() - daysAgoStart);

    applyDates(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
      
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setPreset(0)}
          className="px-4 py-2 bg-[#F4EEE2] text-[#A13E21] hover:bg-[#eadecc] font-bold text-sm rounded-lg transition"
        >
          Hoy
        </button>
        <button 
          onClick={() => setPreset(1, 1)}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-lg transition"
        >
          Ayer
        </button>
        <button 
          onClick={() => setPreset(7)}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-lg transition"
        >
          Últimos 7 Días
        </button>
        <button 
          onClick={() => setPreset(30)}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-lg transition"
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
