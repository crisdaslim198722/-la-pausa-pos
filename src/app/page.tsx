import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { getFinancialMetrics } from "@/features/reports/actions/get-closure";
import { 
  Coffee, 
  ListOrdered, 
  PackageSearch, 
  BookOpen, 
  Calculator, 
  TrendingUp,
  TrendingDown,
  Store,
  ChevronRight,
  PieChart
} from "lucide-react";

export default async function MainDashboardPage() {
  // Obtener resumen rápido de hoy para el mini-dashboard
  const today = new Date().toISOString().split('T')[0];
  const metricsRes = await getFinancialMetrics(today, today);
  const metrics = metricsRes.success && metricsRes.data ? metricsRes.data : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero / Header Section */}
      <div className="bg-[#A13E21] pt-12 pb-24 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 text-white">
          <div className="mb-6 opacity-95">
            <Image 
              src="/images/logo-2.png" 
              alt="la·Pausa Café" 
              width={160} 
              height={80} 
              className="object-contain drop-shadow-md"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Panel de Control</h1>
          <p className="text-xl opacity-80 font-medium">Gestión integral de tu espacio de café de especialidad</p>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-16 relative z-20 space-y-8">
        
        {/* Mini-Dashboard de Hoy */}
        {metrics && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Resumen del Día (Hoy)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-green-600">{formatCurrency(metrics.ingresosTotales)}</p>
                <span className="text-sm font-bold text-gray-500">cobrados</span>
              </div>
            </div>
            
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-800">{metrics.ordenesPagadas}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Órdenes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-500">{formatCurrency(metrics.dineroPendiente)}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">En Barra</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna 1: Operación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-[#F4EEE2] text-[#A13E21] flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Operación</h2>
            </div>

            <DashboardCard 
              href="/pos"
              title="Punto de Venta"
              description="Toma de pedidos rápida y cobro en barra."
              icon={<Coffee className="w-6 h-6" />}
              colorClass="bg-[#A13E21] hover:bg-[#8b341c] text-white"
              iconBg="bg-white/20"
            />
            
            <DashboardCard 
              href="/pos/ordenes"
              title="Órdenes Activas"
              description="Gestión de despachos y cuentas por cobrar."
              icon={<ListOrdered className="w-6 h-6 text-[#A13E21]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#F4EEE2]"
            />
          </div>

          {/* Columna 2: Inventario */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-[#e8f0eb] text-[#3e664f] flex items-center justify-center">
                <PackageSearch className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Inventario</h2>
            </div>

            <DashboardCard 
              href="/inventario/insumos"
              title="Materia Prima"
              description="Gestión de stock y costos de insumos."
              icon={<PackageSearch className="w-6 h-6 text-[#3e664f]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e8f0eb]"
            />
            
            <DashboardCard 
              href="/productos"
              title="Recetas"
              description="Armado de productos y cálculo de producción."
              icon={<BookOpen className="w-6 h-6 text-[#3e664f]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e8f0eb]"
            />
          </div>

          {/* Columna 3: Finanzas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-[#e6eef5] text-[#2b5a82] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Finanzas</h2>
            </div>

            <DashboardCard 
              href="/gastos"
              title="Gastos y Compras"
              description="Inyección de stock e historial de egresos."
              icon={<TrendingDown className="w-6 h-6 text-[#2b5a82]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e6eef5]"
            />
            
            <DashboardCard 
              href="/inventario/precios"
              title="Precios y Márgenes"
              description="Simulador de rentabilidad y precios de venta."
              icon={<Calculator className="w-6 h-6 text-[#2b5a82]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e6eef5]"
            />
            
            <DashboardCard 
              href="/reportes"
              title="Reportes y Cierre"
              description="Métricas diarias, mensuales y top ventas."
              icon={<TrendingUp className="w-6 h-6 text-[#2b5a82]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e6eef5]"
            />

            <DashboardCard 
              href="/reportes/mix"
              title="Mix de Ventas"
              description="Análisis del margen ponderado y participación."
              icon={<PieChart className="w-6 h-6 text-[#2b5a82]" />}
              colorClass="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800"
              iconBg="bg-[#e6eef5]"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponente para reutilizar el estilo de las tarjetas
function DashboardCard({ 
  href, 
  title, 
  description, 
  icon, 
  colorClass,
  iconBg 
}: { 
  href: string, 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  colorClass: string,
  iconBg: string
}) {
  return (
    <Link 
      href={href}
      className={`block p-6 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm ${colorClass}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-80 leading-snug">{description}</p>
    </Link>
  );
}
