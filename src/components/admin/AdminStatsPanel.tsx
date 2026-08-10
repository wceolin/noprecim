import React from 'react';
import { Anuncio, Patrocinador, Cupom } from '../../types';
import { Flame, MousePointerClick, Award, Ticket, TrendingUp } from 'lucide-react';

interface AdminStatsPanelProps {
  anuncios: Anuncio[];
  patrocinadores: Patrocinador[];
  cupons: Cupom[];
}

export const AdminStatsPanel: React.FC<AdminStatsPanelProps> = ({
  anuncios,
  patrocinadores,
  cupons
}) => {
  const totalAnunciosAtivos = anuncios.filter((a) => a.ativo !== false).length;
  const totalCliquesSum = anuncios.reduce((sum, a) => sum + (a.cliques || 0), 0);
  const totalPatrocinadoresAtivos = patrocinadores.filter((p) => p.ativo !== false).length;
  const totalCuponsAtivos = cupons.filter((c) => c.ativo !== false).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Anúncios Ativos */}
      <div className="p-4 rounded-[22px] bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Anúncios Ativos
          </span>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            {totalAnunciosAtivos}
          </p>
        </div>
      </div>

      {/* 2. Total de Cliques Acumulados */}
      <div className="p-4 rounded-[22px] bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <MousePointerClick className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Cliques Somados
          </span>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
            {totalCliquesSum.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* 3. Patrocinadores Ativos */}
      <div className="p-4 rounded-[22px] bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Patrocinadores
          </span>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            {totalPatrocinadoresAtivos}
          </p>
        </div>
      </div>

      {/* 4. Cupons Ativos */}
      <div className="p-4 rounded-[22px] bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Cupons Ativos
          </span>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            {totalCuponsAtivos}
          </p>
        </div>
      </div>

    </div>
  );
};
