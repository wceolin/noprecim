import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Sun,
  Moon,
  Lock,
  MessageCircle,
  Instagram,
  Send
} from 'lucide-react';
import {
  getSocialConfig,
  fetchSocialConfigFromDb,
  buildWhatsAppLink,
  formatInstagramUrl,
  formatTelegramUrl,
  formatTikTokUrl,
  SocialConfig
} from '../../lib/socialConfig';

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

  const [socialConfig, setSocialConfig] = useState<SocialConfig>(getSocialConfig());

  useEffect(() => {
    fetchSocialConfigFromDb().then((cfg) => {
      if (cfg) setSocialConfig(cfg);
    });
  }, []);

  const whatsappUrl = buildWhatsAppLink(socialConfig);
  const instagramUrl = formatInstagramUrl(socialConfig.instagramHandle);
  const telegramUrl = formatTelegramUrl(socialConfig.telegramLink);
  const tiktokUrl = formatTikTokUrl(socialConfig.tiktokLink);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-orange-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Name & Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform bg-amber-400 flex items-center justify-center p-0.5">
                <img
                  src="/src/assets/images/noprecim_exact_mascot_1786477126275.jpg"
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
          <div className="hidden md:flex flex-1 max-w-md mx-2 relative">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Icons: Social Links + Theme Toggle + Admin */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* 1. WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Fale conosco no WhatsApp"
              aria-label="Atendimento via WhatsApp"
              className="p-2 sm:p-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>

            {/* 2. Instagram Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Siga no Instagram"
              aria-label="Instagram NOPRECIM"
              className="p-2 sm:p-2.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* 3. Telegram Button */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Entrar no Grupo do Telegram"
              aria-label="Canal do Telegram"
              className="p-2 sm:p-2.5 rounded-2xl border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/30 text-sky-500 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </a>

            {/* 4. TikTok Button */}
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Siga no TikTok"
              aria-label="TikTok NOPRECIM"
              className="p-2 sm:p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39h.08V9.1a6.34 6.34 0 1 0 6.26 6.24V8.5a8.28 8.28 0 0 0 5.02 1.64V6.69z"/>
              </svg>
            </a>

            {/* Separator Divider */}
            <div className="h-5 w-px bg-orange-200 dark:bg-zinc-800 mx-0.5" />

            {/* 5. Dark/Light Theme Toggle Icon Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar tema claro/escuro"
              className="p-2 sm:p-2.5 rounded-2xl border border-orange-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-orange-600" />
              )}
            </button>

            {/* 6. Admin Lock Icon Button */}
            <button
              onClick={onNavigateAdmin}
              title={isAdmin ? "Painel do Administrador" : "Acessar Painel Admin"}
              aria-label="Acessar Painel Admin"
              className={`p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer ${
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

