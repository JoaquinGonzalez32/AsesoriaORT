import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES, IconDashboard, IconUsers, IconTarget, IconCalendar } from './constants';
import Dashboard from './components/Dashboard';
import LeadsManager from './components/LeadsManager';
import OpportunitiesManager from './components/OpportunitiesManager';
import RasesManager from './components/RasesManager';
import LoginPage from './features/auth/LoginPage';
import { useAuth } from './hooks/useAuth';
import { useLeads } from './hooks/useLeads';
import { useRases } from './hooks/useRases';
import { useOpportunities } from './hooks/useOpportunities';
import { Lead } from './types';

const App: React.FC = () => {
  const { session, user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { leads, fetchLeads, addLead, updateLead, deleteLead } = useLeads();
  const { rases, fetchRases, addRas, updateRas, deleteRas } = useRases();
  const { opportunities, fetchOpportunities, addOpp, updateOpp, deleteOpp } = useOpportunities({ addRas, updateRas });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchLeads(), fetchOpportunities(), fetchRases()]);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error al conectar con Supabase.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [session]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLogin={signIn} onRegister={signUp} />;
  }

  const handleAddLead = (leadData: Omit<Lead, 'lead_id' | 'created_at' | 'updated_at'>) => addLead(leadData, user?.id);
  const handleAddOpp = (oppData: any) => addOpp(oppData, user?.id);
  const handleAddRas = (rasData: any) => addRas(rasData, user?.id);

  const convertToOpportunity = async (lead: Lead, extraData: any) => {
    const newOpp: any = {
      nombre: lead.nombre,
      cedula: extraData.cedula || '',
      telefono: extraData.telefono || '',
      mail: extraData.mail || '',
      sape: extraData.sape || '',
      carrera_interes: lead.carrera_interes,
      otros_intereses: extraData.otros_intereses || [],
      fecha_lead: lead.fecha_lead,
      ras_agendada: extraData.ras_agendada ?? false,
      ras_asistio: false,
      multiple_interes: extraData.multiple_interes ?? false,
      liceo_tipo: extraData.liceo_tipo ?? 'Publico',
      proceso_inicio: extraData.proceso_inicio || '',
      fase_oportunidad: extraData.fase_oportunidad || 'Interesado',
      comentario_extra: `[Conversión Lead]: ${lead.comentario}\n${extraData.comentario_extra || ''}`,
    };

    if (extraData.ras_agendada && extraData.rasInfo) {
      newOpp.rasInfo = extraData.rasInfo;
    }

    await handleAddOpp(newOpp);
    await updateLead({ ...lead, convertido: true, updated_at: new Date().toISOString() });
    navigate(ROUTES.OPPORTUNITIES);
  };

  const navItems = [
    { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: IconDashboard },
    { to: ROUTES.LEADS, label: 'Leads', icon: IconUsers },
    { to: ROUTES.OPPORTUNITIES, label: 'Oportunidades', icon: IconTarget },
    { to: ROUTES.RASES, label: 'Agenda RASES', icon: IconCalendar },
  ];

  const renderContent = () => {
    if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error) return <div className="text-center p-20"><p className="text-red-500 font-bold">{error}</p></div>;
    return (
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} />} />
        <Route path={ROUTES.LEADS} element={<LeadsManager leads={leads} onAdd={handleAddLead} onUpdate={updateLead} onDelete={deleteLead} onConvert={convertToOpportunity} />} />
        <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesManager opportunities={opportunities} onAdd={handleAddOpp} onUpdate={updateOpp} onDelete={deleteOpp} />} />
        <Route path={ROUTES.RASES} element={<RasesManager rases={rases} onAdd={handleAddRas} onDelete={deleteRas} />} />
        <Route path="*" element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-blue-900 text-white w-full flex items-center px-6 py-3 z-20 sticky top-0 shadow-lg gap-6">
        <div className="flex items-center gap-3 mr-4">
          <IconTarget size={24} className="text-blue-200" />
          <h1 className="hidden sm:block text-xl font-bold tracking-tight">CRM Asesoría</h1>
        </div>
        <div className="flex flex-row flex-1 items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-800 text-blue-200'}`
              }
            >
              <item.icon size={20} />
              <span className="hidden md:inline font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-blue-200 hover:bg-blue-800 transition-all duration-200"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span className="hidden md:inline font-medium text-sm">Cerrar Sesión</span>
        </button>
      </nav>
      <main className="flex-1 p-4 md:p-8 min-w-0">
        <div className="space-y-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
