import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { ROUTES, IconDashboard, IconUsers, IconTarget, IconCalendar, IconSettings, IconListaTrabajo, IconFileBarChart } from './constants';
import Dashboard from './components/Dashboard';
import LeadsManager from './components/LeadsManager';
import OpportunitiesManager from './components/OpportunitiesManager';
import RasesManager from './components/RasesManager';
import OportunidadDetalle from './components/OportunidadDetalle';
import GestionUsuarios from './components/GestionUsuarios';
import ListasTrabajo from './components/ListasTrabajo';
import ListaDetalle from './components/ListaDetalle';
import InformesPage from './components/informes/InformesPage';
import RutaProtegida from './components/RutaProtegida';
import LoginPage from './features/auth/LoginPage';
import RecuperarPassword from './features/auth/RecuperarPassword';
import ActualizarPassword from './features/auth/ActualizarPassword';
import Modal from './components/ui/Modal';
import { SkeletonDashboard } from './components/ui/Skeleton';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSoporte, setShowSoporte] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
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
    { to: ROUTES.LISTAS_TRABAJO, label: 'Listas', icon: IconListaTrabajo },
    { to: ROUTES.REPORTS, label: 'Informes', icon: IconFileBarChart },
  ];

  if (tienePermiso(profile?.rol, 'gestionarUsuarios')) {
    navItems.push({ to: ROUTES.USUARIOS, label: 'Usuarios', icon: IconSettings });
  }

  const userInitials = profile
    ? `${(profile.nombre || '')[0] || ''}${(profile.apellido || '')[0] || ''}`.toUpperCase()
    : null;

  const rolBadgeColor: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-200',
    coordinador: 'bg-amber-500/20 text-amber-200',
    asesor: 'bg-blue-400/20 text-blue-200',
  };

  const renderContent = () => {
    if (loading) return <SkeletonDashboard />;
    if (error) return <div className="text-center p-20"><p className="text-red-500 font-bold">{error}</p></div>;
    return (
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} userId={user?.id} />} />
        <Route path={ROUTES.LEADS} element={<LeadsManager leads={leads} onAdd={handleAddLead} onUpdate={updateLead} onDelete={deleteLead} onConvert={convertToOpportunity} onRefresh={fetchLeads} />} />
        <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesManager opportunities={opportunities} onAdd={handleAddOpp} onUpdate={updateOpp} onDelete={deleteOpp} onRefresh={fetchOpportunities} />} />
        <Route path="/opportunities/:id" element={<OportunidadDetalle opportunities={opportunities} rases={rases} onUpdateOpp={updateOpp} onDeleteOpp={deleteOpp} onAddOpp={handleAddOpp} onAddRas={handleAddRas} onUpdateRas={updateRas} onDeleteRas={deleteRas} />} />
        <Route path={ROUTES.RASES} element={<RasesManager rases={rases} opportunities={opportunities} onAdd={handleAddRas} onUpdate={updateRas} onDelete={deleteRas} onUpdateOpp={updateOpp} />} />
        <Route path={ROUTES.USUARIOS} element={<GestionUsuarios />} />
        <Route path={ROUTES.REPORTS} element={<InformesPage leads={leads} opportunities={opportunities} rases={rases} />} />
        <Route path={ROUTES.LISTAS_TRABAJO} element={<ListasTrabajo />} />
        <Route path="/listas-de-trabajo/:id" element={<ListaDetalle />} />
        <Route path="*" element={<Dashboard leads={leads} opportunities={opportunities} rases={rases} userId={user?.id} />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-blue-900 text-white w-full flex items-center px-4 md:px-6 py-3 z-20 sticky top-0 shadow-lg gap-4 md:gap-6" role="navigation" aria-label="Navegacion principal">
        {/* Hamburger mobile */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-xl hover:bg-blue-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Abrir menu de navegacion"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>

          {/* Mobile dropdown */}
          {showMobileMenu && (
            <div className="absolute left-0 top-full w-full bg-blue-900 border-t border-blue-800 shadow-xl z-50 slide-in-from-bottom-2">
              <div className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setShowMobileMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-800 text-blue-200'}`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mr-2 md:mr-4">
          <IconTarget size={24} className="text-blue-200" />
          <h1 className="hidden sm:block text-xl font-bold tracking-tight">CRM Asesoria</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-row flex-1 items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-800 text-blue-200'}`
              }
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Menu de usuario"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {userInitials || <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-tight">{profile?.nombre} {profile?.apellido}</span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${rolBadgeColor[profile?.rol || 'asesor']}`}>
                {profile?.rol}
              </span>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-300" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 slide-in-from-bottom-2" role="menu">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-sm">{profile?.nombre} {profile?.apellido}</p>
                <p className="text-xs text-gray-400">{profile?.email}</p>
              </div>
              <button
                onClick={() => { setShowSoporte(true); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                role="menuitem"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Soporte
              </button>
              <button
                onClick={() => { signOut(); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                role="menuitem"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar Sesion
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 min-w-0">
        <div className="space-y-6">{renderContent()}</div>
      </main>

      {/* Modal Soporte */}
      <Modal open={showSoporte} onClose={() => setShowSoporte(false)} maxWidth="max-w-sm">
        <div className="px-8 py-6 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Soporte</h3>
          <p className="text-sm text-gray-500 mb-5">Contactanos para resolver cualquier problema o consulta sobre el CRM.</p>
          <a
            href="https://wa.me/59891770513"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp: 091 770 513
          </a>
          <p className="text-xs text-gray-400 mt-4">
            Si no puede comunicarse, escriba al mail <a href="mailto:joaquin.felipe46@gmail.com" className="text-blue-600 font-bold hover:underline">joaquin.felipe46@gmail.com</a>
          </p>
        </div>
        <div className="px-8 py-3 bg-gray-50 rounded-b-2xl flex justify-center">
          <button onClick={() => setShowSoporte(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
            Cerrar
          </button>
        </div>
      </Modal>
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
