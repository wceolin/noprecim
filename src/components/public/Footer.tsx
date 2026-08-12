import React, { useState } from 'react';
import { Flame, Heart, ShieldCheck, FileText } from 'lucide-react';
import { LegalModal } from './LegalModal';

export const Footer: React.FC = () => {
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="w-full mt-16 border-t border-orange-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-orange-100/60 dark:border-zinc-800/60 pb-8">
            
            {/* Brand Logo & Description */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 shrink-0 bg-amber-400 flex items-center justify-center p-0.5">
                <img
                  src="/noprecim_logo.jpg"
                  alt="NOPRECIM Logo"
                  className="w-full h-full object-contain rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-base font-black bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  NOPRECIM
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Não vendemos produtos, apenas garimpamos os melhores descontos nas maiores lojas do Brasil. Alguns links podem gerar comissão de afiliado, sem custo extra para você.
                </p>
              </div>
            </div>

            {/* Middle Note */}
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              <p className="flex items-center justify-center gap-1">
                Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> para te ajudar a economizar em cada compra.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center justify-start md:justify-end gap-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <button
                onClick={() => setLegalModalType('privacy')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>Política de Privacidade</span>
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button
                onClick={() => setLegalModalType('terms')}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                <span>Termos de Uso</span>
              </button>
            </div>

          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 gap-2">
            <p>© {new Date().getFullYear()} NOPRECIM. Todos os direitos reservados.</p>
            <p>Os preços e cupons podem variar de acordo com as lojas oficiais parceiras.</p>
          </div>
        </div>
      </footer>

      {/* Legal Dialog Modal */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </>
  );
};
