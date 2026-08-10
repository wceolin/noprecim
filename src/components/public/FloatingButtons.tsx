import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { buildWhatsAppLink } from '../../lib/socialConfig';

export const FloatingButtons: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = buildWhatsAppLink();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Scroll to Top Button (Appears > 400px scroll) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToTop}
            title="Voltar ao topo"
            aria-label="Voltar ao topo"
            className="pointer-events-auto p-3 rounded-2xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 border border-zinc-700/50 dark:border-zinc-200/50 shadow-xl hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp Green Floating Button (Always Visible) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Fale conosco no WhatsApp"
        aria-label="Atendimento via WhatsApp"
        className="pointer-events-auto group relative p-3.5 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
      >
        <span className="absolute -left-36 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap hidden sm:block">
          Dúvidas? Chame no Zap!
        </span>
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>

    </div>
  );
};
