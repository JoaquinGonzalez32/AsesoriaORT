import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { IconTarget } from '../../constants';

const RecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/actualizar-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <IconTarget size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM Asesoria</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recuperar contrasena</h2>
            <p className="text-sm text-gray-500 mt-1">Te enviaremos un link para restablecer tu contrasena</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {error}
            </div>
          )}

          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 font-medium">
              Revisa tu bandeja de entrada. Te enviamos un link de recuperacion a <strong>{email}</strong>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Correo Electronico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@ejemplo.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar link de recuperacion'}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-600 font-medium hover:underline">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
