import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lead, Oportunidad, ResultadoLlamada } from '../types';

interface DashboardProps {
  leads: Lead[];
  opportunities: Oportunidad[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads, opportunities }) => {
  const activeLeads = useMemo(() => leads.filter(l => !l.deleted_at), [leads]);
  const activeOpps = useMemo(() => opportunities.filter(o => !o.deleted_at), [opportunities]);

  const stats = useMemo(() => {
    return {
      totalLeads: activeLeads.length,
      primerContacto: activeLeads.filter(l => l.resultado_llamada === ResultadoLlamada.PrimerContacto).length,
      contactados: activeLeads.filter(l => l.resultado_llamada === ResultadoLlamada.Contactado).length,
      interesados: activeLeads.filter(l => l.resultado_llamada === ResultadoLlamada.Interesado).length,
      totalOpps: activeOpps.length,
      rasAgendadas: activeOpps.filter(o => o.ras_agendada).length,
      rasAsistidas: activeOpps.filter(o => o.ras_asistio).length,
    };
  }, [activeLeads, activeOpps]);

  const chartData = [
    { name: 'Nuevos (1er C)', value: stats.primerContacto, color: '#0ea5e9' },
    { name: 'Contactados', value: stats.contactados, color: '#10b981' },
    { name: 'Interesados', value: stats.interesados, color: '#f59e0b' },
    { name: 'Oportunidades', value: stats.totalOpps, color: '#8b5cf6' },
  ];

  const StatCard = ({ title, value, sub, iconColor }: { title: string, value: number, sub: string, iconColor: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">{title}</h3>
          <div className={`w-3 h-3 rounded-full ${iconColor} shadow-inner group-hover:scale-125 transition-transform`}></div>
        </div>
        <div className="text-4xl font-black text-gray-900">{value}</div>
      </div>
      <div className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Admisiones</h2>
          <p className="text-gray-500 mt-1 font-medium">Control en tiempo real del embudo comercial</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">7 Días</button>
          <button className="bg-white shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-blue-600 transition-all">Este Mes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        <StatCard title="Total Leads" value={stats.totalLeads} sub="Base de Datos" iconColor="bg-gray-400" />
        <StatCard title="1er Contacto" value={stats.primerContacto} sub="Nuevos" iconColor="bg-sky-500" />
        <StatCard title="Contactados" value={stats.contactados} sub="Efectividad" iconColor="bg-green-500" />
        <StatCard title="Interesados" value={stats.interesados} sub="Calificados" iconColor="bg-yellow-500" />
        <StatCard title="Opps" value={stats.totalOpps} sub="Ventas" iconColor="bg-purple-500" />
        <StatCard title="RAS Agend." value={stats.rasAgendadas} sub="Agendados" iconColor="bg-indigo-500" />
        <StatCard title="RAS Asist." value={stats.rasAsistidas} sub="Cierres" iconColor="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[450px]">
          <h3 className="text-lg font-bold mb-8 text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Estado del Embudo
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  cursor={{fill: '#f9fafb'}}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Top Carreras por Interés
          </h3>
          <div className="space-y-5">
            {Array.from(new Set(activeLeads.map(l => l.carrera_interes))).filter(Boolean).slice(0, 6).map((carrera, idx) => {
               const count = activeLeads.filter(l => l.carrera_interes === carrera).length;
               const percentage = Math.round((count / activeLeads.length) * 100) || 0;
               const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-sky-500'];
               return (
                 <div key={carrera} className="group">
                   <div className="flex justify-between text-sm mb-1.5">
                     <span className="font-bold text-gray-700">{carrera}</span>
                     <span className="text-gray-400 font-black">{percentage}% <span className="text-[10px] opacity-50">({count})</span></span>
                   </div>
                   <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                     <div className={`${colors[idx % colors.length]} h-full transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${percentage}%` }}></div>
                   </div>
                 </div>
               );
            })}
            {activeLeads.length === 0 && (
               <div className="py-10 text-center text-gray-400 italic">No hay datos de carreras registrados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;