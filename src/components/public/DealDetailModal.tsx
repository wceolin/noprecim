import React, { useState } from 'react';
import { Anuncio } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SignedImage } from '../ui/SignedImage';
import { registrarClique } from '../../lib/supabase';
import { ExternalLink, Copy, Check, MapPin, Tag, Eye, ShieldCheck, Flame } from 'lucide-react';

interface DealDetailModalProps {
  anuncio: Anuncio | null;
  onClose: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ anuncio, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!anuncio) return null;

  const images = anuncio.imagens && anuncio.imagens.length > 0
    ? anuncio.imagens
    : ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80'];

  const formatLink = (rawUrl?: string | null): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleCopyCupom = async () => {
    if (anuncio.cupom) {
      try {
        await navigator.clipboard.writeText(anuncio.cupom);
      } catch (err) {
        console.error('Clipboard error:', err);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Register click metric and open partner link in new tab
      try {
        await registrarClique(anuncio.id);
      } catch (e) {
        console.error('Click record error:', e);
      }

      const linkToOpen = formatLink(anuncio.link) || formatLink(anuncio.patrocinador?.link);
      if (linkToOpen) {
        window.open(linkToOpen, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleGoToLink = async () => {
    try {
      await registrarClique(anuncio.id);
    } catch (e) {
      console.error('Click record error:', e);
    }
    const linkToOpen = formatLink(anuncio.link) || formatLink(anuncio.patrocinador?.link);
    if (linkToOpen) {
      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal isOpen={Boolean(anuncio)} onClose={onClose} maxWidth="xl">
      <div className="space-y-5">
        
        {/* Main Image & Thumbnail Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-orange-100 dark:border-zinc-800">
            <SignedImage
              path={images[selectedImageIndex] || images[0]}
              alt={anuncio.titulo}
              className="w-full h-full object-contain"
            />
            {anuncio.selo && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="oferta">{anuncio.selo}</Badge>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <SignedImage path={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {anuncio.categoria}
            </span>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Eye className="w-3.5 h-3.5 text-orange-500" />
              <span>{anuncio.cliques || 0} visualizações</span>
            </div>
          </div>

          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-snug">
            {anuncio.titulo}
          </h2>

          {anuncio.patrocinador && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50/60 dark:bg-zinc-800/60 border border-orange-100 dark:border-zinc-800 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Vendido/Oferecido por: <strong className="text-orange-600 dark:text-orange-400">{anuncio.patrocinador.nome}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Price & Location */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 dark:from-zinc-800 dark:to-zinc-800/80 border border-orange-200/80 dark:border-zinc-700 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Preço Promocional</span>
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {anuncio.preco}
            </span>
          </div>

          {anuncio.localizacao && (
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Região / Envio</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{anuncio.localizacao}</span>
              </div>
            </div>
          )}
        </div>

        {/* Cupom Code Box */}
        {anuncio.cupom && (
          <div className="p-3.5 rounded-2xl bg-orange-100 dark:bg-zinc-800 border-2 border-dashed border-orange-400 dark:border-zinc-600 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-orange-800 dark:text-orange-300 tracking-wider block">
                Cupom de Desconto Exclusivo
              </span>
              <span className="font-mono font-black text-lg tracking-widest text-orange-950 dark:text-orange-100">
                {anuncio.cupom}
              </span>
            </div>

            <Button variant="primary" size="sm" onClick={handleCopyCupom} icon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}>
              {copied ? 'Copiado!' : 'Copiar Código'}
            </Button>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Detalhes do Produto</h4>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {anuncio.descricao}
          </p>
        </div>

        {/* Action button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            variant="primary"
            size="lg"
            className="w-full py-4 text-base font-bold shadow-xl shadow-orange-500/25"
            onClick={handleGoToLink}
            icon={<ExternalLink className="w-5 h-5" />}
          >
            Ir para a Oferta no Site Oficial
          </Button>
          <p className="text-[10px] text-center text-zinc-400 mt-2">
            Ao clicar, você será redirecionado para a loja parceira oficial. Link verificado.
          </p>
        </div>

      </div>
    </Modal>
  );
};
