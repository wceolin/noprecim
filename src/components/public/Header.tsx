import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Flame,
  Search,
  Sun,
  Moon,
  Copy,
  Share2,
  Lock
} from 'lucide-react';

interface HeaderProps {
  onOpenConfig?: () => void;
  onNavigateAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'ofertas' | 'cupons';
  setActiveTab: (tab: 'ofertas' | 'cupons') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateAdmin,
  searchQuery,
  setSearchQuery,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado!', 'success');
    } catch (e) {
      showToast('Não foi possível copiar o link', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NOPRECIM',
          text: 'Confira os melhores e mais baratos achadinhos, cupons e ofertas no precinho!',
          url: window.location.href
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-orange-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Name & Logo */}
          <div className="flex items-center gap-2.5">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform bg-amber-400 flex items-center justify-center p-0.5">
                <img
                  src="/src/assets/images/noprecim_mascot_logo_1786476553702.jpg"
                  alt="NOPRECIM Logo"
                  className="w-full h-full object-contain rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  NOPRECIM
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider -mt-0.5 hidden sm:block">
                  Ofertas, Promoções & Cupons
                </p>
              </div>
            </a>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por ofertas, produto ou cupom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs font-medium rounded-2xl border border-orange-200/80 dark:border-zinc-800 bg-orange-50/30 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            
            {/* 1. Copy Link Icon Button */}
            <button
              onClick={handleCopyLink}
              title="Copiar link da página"
              aria-label="Copiar link da página"
              className="p-2.5 rounded-2xl border border-orange-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* 2. Share Icon Button */}
            <button
              onClick={handleShare}
              title="Compartilhar página"
              aria-label="Compartilhar página"
              className="p-2.5 rounded-2xl border border-orange-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* 3. Dark/Light Theme Toggle Icon Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar tema claro/escuro"
              className="p-2.5 rounded-2xl border border-orange-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-orange-600" />
              )}
            </button>

            {/* 4. Admin Lock Icon Button */}
            <button
              onClick={onNavigateAdmin}
              title={isAdmin ? "Painel do Administrador" : "Acessar Painel Admin"}
              aria-label="Acessar Painel Admin"
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-gradient-to-tr from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95'
                  : 'border border-orange-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-zinc-800 hover:text-orange-600'
              }`}
            >
              <Lock className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por ofertas, produtos ou cupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-2xl border border-orange-200/80 dark:border-zinc-800 bg-orange-50/40 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-orange-500"
          />
        </div>

      </div>
    </header>
  );
};

