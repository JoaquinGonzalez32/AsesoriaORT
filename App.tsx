import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES, IconDashboard, IconUsers, IconTarget, IconCalendar, IconSettings, IconListaTrabajo } from './constants';
import Dashboard from './components/Dashboard';
import LeadsManager from './components/LeadsManager';
import OpportunitiesManager from './components/OpportunitiesManager';
import RasesManager from './components/RasesManager';
import OportunidadDetalle from './components/OportunidadDetalle';
import GestionUsuarios from './components/GestionUsuarios';
import ListasTrabajo from './components/ListasTrabajo';
import RutaProtegida from './components/RutaProtegida';
import LoginPage from './features/auth/LoginPage';
import RecuperarPassword from './features/auth/RecuperarPassword';
import ActualizarPassword from './features/auth/ActualizarPassword';
import { useAuth } from './hooks/useAuth';
import { useLeads } from './hooks/useLeads';
import { useRases } from './hooks/useRases';
import { useOpportunities } from './hooks/useOpportunities';
import { tienePermiso } from './lib/permisos';
import { Lead } from './types';

const AppLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { leads, fetchLeads, addLead, updateLead, deleteLead } = useLeads();
  const { rases, fetchRases, addRas, updateRas, deleteRas } = useRases();
  const { opportunities, fetchOpportunities, addOpp, updateOpp, deleteOpp } = useOpportunities({ addRas, updateRas });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      multiple_interes: extraData.multiple_interes ?? false,
      liceo_tipo: extraData.liceo_tipo ?? 'Publico',
      proceso_inicio: extraData.proceso_inicio || '',
      fase_oportunidad: extraData.fase_oportunidad || 'Interesado',
      comentario_extra: `[Conversion Lead]: ${lead.comentario}\n${extraData.comentario_extra || ''}`,
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
    { to: ROUTES.LISTAS_TRABAJO, label: 'Listas de Trabajo', icon: IconListaTrabajo },
  ];

  if (tienePermiso(profile?.rol, 'gestionarUsuarios')) {
    navItems.push({ to: ROUTES.USUARIOS, label: 'Usuarios', icon: IconSettings });
  }

  const userInitials = profile
    ? `${(profile.nombre || '')[0] || ''}${(profile.apellido || '')[0] || ''}`.toUpperCase()
    : '?';

  const rolBadgeColor: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-200',
    coordinador: 'bg-amber-500/20 text-amber-200',
    asesor: 'bg-blue-400/20 text-blue-200',
  };

  const renderContent = () => {
    if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error) return <div className="text-center p-20"><p className="text-red-500 font-bold">{error}</p></div>;
    return (
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} />} />
        <Route path={ROUTES.LEADS} element={<LeadsManager leads={leads} onAdd={handleAddLead} onUpdate={updateLead} onDelete={deleteLead} onConvert={convertToOpportunity} />} />
        <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesManager opportunities={opportunities} onAdd={handleAddOpp} onUpdate={updateOpp} onDelete={deleteOpp} />} />
        <Route path="/opportunities/:id" element={<OportunidadDetalle opportunities={opportunities} rases={rases} onUpdateOpp={updateOpp} onDeleteOpp={deleteOpp} onAddOpp={handleAddOpp} onAddRas={handleAddRas} onUpdateRas={updateRas} onDeleteRas={deleteRas} />} />
        <Route path={ROUTES.RASES} element={<RasesManager rases={rases} opportunities={opportunities} onAdd={handleAddRas} onUpdate={updateRas} onDelete={deleteRas} onUpdateOpp={updateOpp} />} />
        <Route path={ROUTES.USUARIOS} element={<GestionUsuarios />} />
        <Route path={ROUTES.LISTAS_TRABAJO} element={<ListasTrabajo />} />
        <Route path="*" element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-blue-900 text-white w-full flex items-center px-6 py-3 z-20 sticky top-0 shadow-lg gap-6">
        <div className="flex items-center gap-3 mr-4">
          <IconTarget size={24} className="text-blue-200" />
          <h1 className="hidden sm:block text-xl font-bold tracking-tight">CRM Asesoria</h1>
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

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-800 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {userInitials}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-tight">{profile?.nombre} {profile?.apellido}</span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${rolBadgeColor[profile?.rol || 'asesor']}`}>
                {profile?.rol}
              </span>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-300"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-sm">{profile?.nombre} {profile?.apellido}</p>
                <p className="text-xs text-gray-400">{profile?.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar Sesion
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 min-w-0">
        <div className="space-y-6">{renderContent()}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.RECUPERAR_PASSWORD} element={<RecuperarPassword />} />
      <Route path={ROUTES.ACTUALIZAR_PASSWORD} element={<ActualizarPassword />} />
      <Route element={<RutaProtegida />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
    </Routes>
  );
};

export default App;
