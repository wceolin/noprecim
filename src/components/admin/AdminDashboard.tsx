import React from 'react';
import { Anuncio, Patrocinador, Cupom } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { isSupabaseConfigured } from '../../lib/supabase';
import { MousePointerClick, Flame, Ticket, Award, Database, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';

interface AdminDashboardProps {
  anuncios: Anuncio[];
  patrocinadores: Patrocinador[];
  cupons: Cupom[];
  onNavigateTab: (tab: 'anuncios' | 'patrocinadores' | 'cupons') => void;
  onOpenConfig: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  anuncios,
  patrocinadores,
  cupons,
  onNavigateTab,
  onOpenConfig
}) => {
  const configured = isSupabaseConfigured();

  const totalClicksAnuncios = anuncios.reduce((acc, curr) => acc + (curr.cliques || 0), 0);
  const totalClicksSponsors = patrocinadores.reduce((acc, curr) => acc + (curr.cliques || 0), 0);
  const grandTotalClicks = totalClicksAnuncios + totalClicksSponsors;

  const activeAnunciosCount = anuncios.filter(a => a.ativo).length;
  const activeCuponsCount = cupons.filter(c => c.ativo).length;
  const activePatrocinadoresCount = patrocinadores.filter(p => p.ativo).length;

  const topAnuncios = [...anuncios].sort((a, b) => (b.cliques || 0) - (a.cliques || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* DB Connection Banner */}
      <div className={`p-4 rounded-[20px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        configured
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            configured ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${configured ? 'text-emerald-950 dark:text-emerald-200' : 'text-amber-950 dark:text-amber-200'}`}>
              {configured ? 'Base de Dados Supabase Conectada' : 'Modo Demonstração Ativo'}
            </h3>
            <p className={`text-xs ${configured ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {configured
                ? 'Seu painel está sincronizado em tempo real com o Supabase existente.'
                : 'Conecte sua URL e Anon Key do Supabase para salvar dados permanentemente.'}
            </p>
          </div>
        </div>

        <Button
          variant={configured ? 'outline' : 'primary'}
          size="sm"
          onClick={onOpenConfig}
        >
          {configured ? 'Gerenciar Conexão' : 'Conectar Supabase Agora'}
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border border-orange-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Acessos em Links</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{grandTotalClicks}</span>
          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Clique em afiliados & parceiros
          </p>
        </Card>

        <Card className="border border-orange-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Ofertas Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{activeAnunciosCount}</span>
          <p className="text-[10px] text-zinc-400 mt-1">Total de {anuncios.length} cadastradas</p>
        </Card>

        <Card className="border border-orange-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Cupons Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-600">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{activeCuponsCount}</span>
          <p className="text-[10px] text-zinc-400 mt-1">Total de {cupons.length} disponíveis</p>
        </Card>

        <Card className="border border-orange-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Patrocinadores</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{activePatrocinadoresCount}</span>
          <p className="text-[10px] text-zinc-400 mt-1">Parceiros oficiais com banner</p>
        </Card>

      </div>

      {/* Top Performing Offers */}
      <Card className="p-6 border border-orange-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Ofertas Mais Clicadas
            </h3>
            <p className="text-xs text-zinc-500">
              Ranking dos links de afiliados com maior taxa de conversão no site.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigateTab('anuncios')}>
            Ver Todas
          </Button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {topAnuncios.map((item, index) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 font-black text-xs flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {item.titulo}
                  </p>
                  <p className="text-xs text-zinc-400">{item.categoria} • {item.preco}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {item.cliques || 0} cliques
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
