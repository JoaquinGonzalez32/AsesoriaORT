import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RutaProtegida: React.FC = () => {
  const { session, profile, loading, signOut } = useAuth();
  const [deactivated, setDeactivated] = useState(false);

  useEffect(() => {
    if (profile && !profile.activo) {
      setDeactivated(true);
      signOut().catch(() => {});
    }
  }, [profile, signOut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (deactivated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-6 py-4 font-medium max-w-md text-center">
          Tu cuenta ha sido desactivada. Contacta al administrador.
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RutaProtegida;
