'use client';

import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#111]">L</span>
            </div>
            <span className="text-3xl font-bold text-surface-900">Lumono</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">
            Smart Inventory Management
          </h1>
          <p className="text-surface-600">
            Inicia sesion para continuar
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-[var(--status-critical)] border border-[var(--border)] text-[#cc6060] px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@lumono.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <Input
                  label="Contrasena"
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <div className="bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-surface-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-surface-900 mb-2">Credenciales de prueba:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-700 font-medium">Email:</span>
                        <code className="text-xs font-mono text-surface-900 bg-surface-300 px-2 py-0.5 rounded">admin@lumono.com</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-700 font-medium">Password:</span>
                        <code className="text-xs font-mono text-surface-900 bg-surface-300 px-2 py-0.5 rounded">admin123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-surface-600 mt-8">
          © 2025 Lumono. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
