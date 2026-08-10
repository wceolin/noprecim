import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Anuncio } from '../../types';
import { SignedImage } from '../ui/SignedImage';
import { useToast } from '../../context/ToastContext';
import { registrarClique } from '../../lib/supabase';
import { ExternalLink, Tag, Flame, Check, Copy, Store } from 'lucide-react';

interface AnuncioCardProps {
  anuncio: Anuncio;
  onSelect: (anuncio: Anuncio) => void;
  index?: number;
}

export const AnuncioCard: React.FC<AnuncioCardProps> = ({ anuncio, onSelect, index = 0 }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const mainImage = anuncio.imagens && anuncio.imagens.length > 0 ? anuncio.imagens[0] : '';

  const formatLink = (rawUrl?: string | null): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleCopyCupom = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (anuncio.cupom) {
      try {
        await navigator.clipboard.writeText(anuncio.cupom);
      } catch (err) {
        console.error('Clipboard error:', err);
      }
      setCopied(true);
      showToast(`Cupom ${anuncio.cupom} copiado! Redirecionando...`, 'success');
      setTimeout(() => setCopied(false), 2000);

      try {
        await registrarClique(anuncio.id);
      } catch (err) {
        console.error('Error tracking click:', err);
      }

      const linkToOpen = formatLink(anuncio.link) || formatLink(anuncio.patrocinador?.link);
      if (linkToOpen) {
        window.open(linkToOpen, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await registrarClique(anuncio.id);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
    const linkToOpen = formatLink(anuncio.link) || formatLink(anuncio.patrocinador?.link);
    if (linkToOpen) {
      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onClick={() => onSelect(anuncio)}
      className="cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden rounded-[26px] bg-white dark:bg-zinc-900 border border-orange-100/90 dark:border-zinc-800 p-3.5 shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="space-y-2.5">
        
        {/* Cover Image Container */}
        <div className="relative aspect-square w-full rounded-[20px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <SignedImage
            path={mainImage}
            alt={anuncio.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Selo / Badge Overlay Top-Left */}
          {anuncio.selo && (
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current shrink-0" />
                <span>{anuncio.selo}</span>
              </span>
            </div>
          )}
        </div>

        {/* Category (Left) & Coupon (Right) Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Categoria */}
          <span className="text-[11px] font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase truncate max-w-[55%]">
            {anuncio.categoria || 'OFERTA'}
          </span>

          {/* Cupom Badge */}
          {anuncio.cupom ? (
            <div
              onClick={handleCopyCupom}
              title="Clique para copiar cupom"
              className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-mono flex items-center gap-1 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{copied ? 'Copiado!' : anuncio.cupom}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600 ml-0.5" /> : <Copy className="w-3 h-3 opacity-60 ml-0.5" />}
            </div>
          ) : null}
        </div>

        {/* Title / Titulo */}
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
          {anuncio.titulo}
        </h3>

        {/* Description / Descrição */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {anuncio.descricao}
        </p>

      </div>

      <div className="space-y-3 pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800">
        
        {/* Valor (Left) & Icone do Parceiro (Right) */}
        <div className="flex items-center justify-between gap-2">
          {/* Valor */}
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Preço</span>
            <span className="text-xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
              {anuncio.preco}
            </span>
          </div>

          {/* Icone do Parceiro / Patrocinador */}
          <div className="flex items-center gap-1">
            {anuncio.patrocinador?.icone || anuncio.patrocinador?.imagem ? (
              <div
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-300 dark:border-zinc-700 bg-white p-0.5 shadow-sm"
                title={`Parceiro: ${anuncio.patrocinador.nome}`}
              >
                <SignedImage
                  path={anuncio.patrocinador.icone || anuncio.patrocinador.imagem}
                  alt={anuncio.patrocinador.nome}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-zinc-700 flex items-center justify-center shadow-xs"
                title="Loja Parceira Verificada"
              >
                <Store className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Ver Oferta Button -> Direct to registered link */}
        <button
          type="button"
          onClick={handleAffiliateClick}
          className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Ver Oferta</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

      </div>
    </motion.div>
  );
};

