import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Shield,
  Mail,
  Lock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  UserPlus,
  LogIn,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onBackToPublic: () => void;
  onOpenConfig: () => void;
}

type AuthMode = 'login' | 'signup';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic, onOpenConfig }) => {
  const { login, signUp, loginAsDemoAdmin } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();
  const TARGET_ADMIN_EMAIL = 'welington.ceolin@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem. Digite novamente.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }

      const res = await signUp(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMessage(
          res.message ||
          `Usuário ${email} criado com sucesso! ${
            email.toLowerCase() === TARGET_ADMIN_EMAIL
              ? 'Permissão de administrador concedida automaticamente.'
              : ''
          }`
        );
      }
    } else {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Site Público
        </button>

        <Card className="p-7 border border-orange-200 dark:border-zinc-800 shadow-2xl space-y-5">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                Painel Administrativo
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {mode === 'login'
                  ? 'Acesse com sua conta cadastrada'
                  : 'Cadastre um novo usuário no Supabase'}
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-orange-50/80 dark:bg-zinc-800/80 border border-orange-100 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Usuário</span>
            </button>
          </div>

          {/* Database Status Indicator */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{configured ? 'Supabase Cloud Conectado' : 'Banco de Dados Ativo'}</span>
            </div>
            <button
              type="button"
              onClick={onOpenConfig}
              className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
            >
              Configurar DB
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder={TARGET_ADMIN_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {mode === 'signup' && (
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-orange-500/20"
              isLoading={loading}
              icon={mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Entrar no Painel' : 'Cadastrar Usuário no Supabase'}
            </Button>
          </form>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-400 mb-2">Quer testar o painel sem realizar login?</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={loginAsDemoAdmin}
              icon={<Sparkles className="w-3.5 h-3.5 text-orange-600" />}
            >
              Acessar Modo Demo de Teste (Admin)
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
};

