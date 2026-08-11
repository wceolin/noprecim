import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchAnuncios, fetchPatrocinadores, fetchCupons } from '../lib/supabase';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminStatsPanel } from '../components/admin/AdminStatsPanel';
import { AnunciosManager } from '../components/admin/AnunciosManager';
import { PatrocinadoresManager } from '../components/admin/PatrocinadoresManager';
import { CuponsManager } from '../components/admin/CuponsManager';
import { SocialConfigManager } from '../components/admin/SocialConfigManager';
import { AdminRolesManager } from '../components/admin/AdminRolesManager';
import { SupabaseConfigModal } from '../components/ui/SupabaseConfigModal';
import { Button } from '../components/ui/Button';
import {
  Shield,
  Flame,
  Award,
  Ticket,
  Share2,
  Users,
  LogOut,
  ArrowLeft,
  Database,
  Lock,
  AlertOctagon
} from 'lucide-react';

interface AdminPageProps {
  onBackToPublic: () => void;
}

type AdminTab = 'anuncios' | 'patrocinadores' | 'cupons' | 'redes_sociais' | 'administradores';

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToPublic }) => {
  const { user, isAdmin, loading, isDemoAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('anuncios');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // React Query cached queries for admin managers
  const {
    data: anuncios = [],
    refetch: refetchAnuncios
  } = useQuery({
    queryKey: ['admin_anuncios'],
    queryFn: () => fetchAnuncios(true)
  });

  const {
    data: patrocinadores = [],
    refetch: refetchPatrocinadores
  } = useQuery({
    queryKey: ['admin_patrocinadores'],
    queryFn: () => fetchPatrocinadores(true)
  });

  const {
    data: cupons = [],
    refetch: refetchCupons
  } = useQuery({
    queryKey: ['admin_cupons'],
    queryFn: () => fetchCupons(true)
  });

  const handleRefreshAll = () => {
    refetchAnuncios();
    refetchPatrocinadores();
    refetchCupons();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
        <p className="text-xs font-bold text-zinc-500 mt-3">Verificando papéis no banco de dados...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated -> Show Login Form
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <AdminLogin
          onBackToPublic={onBackToPublic}
          onOpenConfig={() => setIsConfigOpen(true)}
        />
        <SupabaseConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />
      </div>
    );
  }

  // Case 2: Logged in user BUT DOES NOT HAVE "admin" ROLE
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-[28px] border border-rose-200 dark:border-rose-950 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-rose-600 dark:text-rose-400">
              Acesso Negado
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              O usuário <strong>{user.email}</strong> está autenticado, mas não possui a permissão de administrador (<code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">role: "admin"</code>) na tabela <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">user_roles</code>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onBackToPublic}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar ao Site
            </Button>
            
            <Button
              variant="danger"
              onClick={() => logout()}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Logged in and IS ADMIN -> Render Admin Panel with 5 Tabs + Stats
  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      
      {/* Sticky Admin Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-b border-orange-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="p-2 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Voltar ao Site Público"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-md shrink-0 bg-amber-400 flex items-center justify-center p-0.5">
                <img
                  src="/src/assets/images/noprecim_mascot_logo_1786476553702.jpg"
                  alt="NOPRECIM"
                  className="w-full h-full object-contain rounded-[12px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Painel NOPRECIM</span>
                  {isDemoAdmin && (
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                      Demo Mode
                    </span>
                  )}
                </h1>
                <p className="text-[10px] text-zinc-400 truncate max-w-xs">
                  {user.email || 'admin@noprecim.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              icon={<Database className="w-3.5 h-3.5" />}
            >
              Conexão DB
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => logout()}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sair
            </Button>
          </div>

        </div>

        {/* 5 Requested Tabs Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-orange-100/60 dark:border-zinc-800/80">
          
          {/* Tab 1: Anúncios */}
          <button
            onClick={() => setActiveTab('anuncios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'anuncios'
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Anúncios ({anuncios.length})</span>
          </button>

          {/* Tab 2: Patrocinadores */}
          <button
            onClick={() => setActiveTab('patrocinadores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'patrocinadores'
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Patrocinadores ({patrocinadores.length})</span>
          </button>

          {/* Tab 3: Cupons */}
          <button
            onClick={() => setActiveTab('cupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'cupons'
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Cupons ({cupons.length})</span>
          </button>

          {/* Tab 4: Redes sociais */}
          <button
            onClick={() => setActiveTab('redes_sociais')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'redes_sociais'
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Redes Sociais</span>
          </button>

          {/* Tab 5: Administradores */}
          <button
            onClick={() => setActiveTab('administradores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'administradores'
                ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Administradores</span>
          </button>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Statistics Summary Panel at Top of /admin */}
        <AdminStatsPanel
          anuncios={anuncios}
          patrocinadores={patrocinadores}
          cupons={cupons}
        />

        {activeTab === 'anuncios' && (
          <AnunciosManager
            anuncios={anuncios}
            patrocinadores={patrocinadores}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'patrocinadores' && (
          <PatrocinadoresManager
            patrocinadores={patrocinadores}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'cupons' && (
          <CuponsManager
            cupons={cupons}
            patrocinadores={patrocinadores}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'redes_sociais' && (
          <SocialConfigManager />
        )}

        {activeTab === 'administradores' && (
          <AdminRolesManager />
        )}

      </main>

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={handleRefreshAll}
      />
    </div>
  );
};
