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
  Send,
  Download,
  Settings,
  X
} from 'lucide-react';
import {
  getSocialConfig,
  fetchSocialConfigFromDb,
  buildWhatsAppLink,
  formatInstagramUrl,
  formatTelegramUrl,
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchSocialConfigFromDb().then((cfg) => {
      if (cfg) setSocialConfig(cfg);
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    setIsSettingsOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Instalação do app iniciada!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        showToast('Para instalar no iPhone: toque em Compartilhar no Safari e selecione "Adicionar à Tela de Início"', 'info');
      } else {
        showToast('Para instalar o App: abra o menu do navegador e escolha "Instalar aplicativo" ou "Adicionar à tela de início"', 'info');
      }
    }
  };

  const whatsappUrl = buildWhatsAppLink(socialConfig);
  const instagramUrl = formatInstagramUrl(socialConfig.instagramHandle);
  const telegramUrl = formatTelegramUrl(socialConfig.telegramLink);

  const renderSocialIcons = () => (
    <div className="flex items-center gap-1.5 xs:gap-2">
      {/* 1. WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Fale conosco no WhatsApp"
        aria-label="Atendimento via WhatsApp"
        className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#FFF2F4] dark:bg-rose-950/40 border border-rose-100/80 dark:border-rose-900/50 flex items-center justify-center text-[#FF4820] dark:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
      >
        <MessageCircle className="w-4 h-4 xs:w-5 xs:h-5 stroke-[1.75]" />
      </a>

      {/* 2. Instagram */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Siga no Instagram"
        aria-label="Instagram NOPRECIM"
        className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#FFF2F4] dark:bg-rose-950/40 border border-rose-100/80 dark:border-rose-900/50 flex items-center justify-center text-[#FF4820] dark:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
      >
        <Instagram className="w-4 h-4 xs:w-5 xs:h-5 stroke-[1.75]" />
      </a>

      {/* 3. Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Entrar no Grupo do Telegram"
        aria-label="Canal do Telegram"
        className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-[#FFF2F4] dark:bg-rose-950/40 border border-rose-100/80 dark:border-rose-900/50 flex items-center justify-center text-[#FF4820] dark:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
      >
        <Send className="w-4 h-4 xs:w-5 xs:h-5 stroke-[1.75] -ml-0.5" />
      </a>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-orange-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        
        {/* LINE 1: Main Header Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Name & Logo (Left) */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform bg-amber-400 flex items-center justify-center p-0.5">
                <img
                  src="/src/assets/images/noprecim_exact_mascot_1786477126275.jpg"
                  alt="NOPRECIM Logo"
                  className="w-full h-full object-contain rounded-[12px] xs:rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  NOPRECIM
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider -mt-0.5 hidden md:block">
                  Ofertas, Promoções & Cupons
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Search Input (Middle - Between NOPRECIM and Icons) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por ofertas, marcas ou cupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-orange-500 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-all shadow-xs"
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

          {/* Header Icons Group (Far Right Corner - Social Icons + Gear Settings) */}
          <div className="flex items-center gap-1.5 xs:gap-2.5 shrink-0 ml-auto">
            
            {/* Social Icons (WhatsApp, Instagram, Telegram) */}
            {renderSocialIcons()}

            {/* Gear Settings Button (Expands Options) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Configurações e Opções"
                aria-label="Abrir menu de configurações"
                className={`p-2 xs:p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1 ${
                  isSettingsOpen
                    ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'border-orange-200 dark:border-zinc-800 bg-orange-50/50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-orange-100 dark:hover:bg-zinc-800 hover:text-orange-600'
                }`}
              >
                <Settings className={`w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Settings Dropdown Popover */}
              {isSettingsOpen && (
                <>
                  {/* Backdrop overlay for quick dismissal */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSettingsOpen(false)}
                  />

                  <div className="absolute right-0 top-11 xs:top-12 z-50 w-60 xs:w-64 bg-white dark:bg-zinc-900 rounded-3xl border border-orange-200 dark:border-zinc-800 shadow-2xl p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 px-2">
                      <span className="text-[10px] xs:text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                        Opções & Configurações
                      </span>
                      <button
                        onClick={() => setIsSettingsOpen(false)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Option 1: Dark / Light Mode Toggle */}
                    <button
                      onClick={() => {
                        toggleTheme();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
                          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Aparência do Site
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Mudar para modo {theme === 'dark' ? 'Claro' : 'Escuro'}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Option 2: Install PWA App */}
                    <button
                      onClick={handleInstallApp}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Instalar Aplicativo
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Baixar o App NOPRECIM no celular
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Option 3: Admin Panel */}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        if (onNavigateAdmin) onNavigateAdmin();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-orange-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Painel do Administrador
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {isAdmin ? 'Gerenciar ofertas e cupons' : 'Acessar com senha admin'}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 md:hidden relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por ofertas, marcas ou cupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-2xl border border-orange-200/80 dark:border-zinc-800 bg-orange-50/40 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-all"
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

      </div>
    </header>
  );
};



