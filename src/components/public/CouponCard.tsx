import React, { useState } from 'react';
import { Cupom } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SignedImage } from '../ui/SignedImage';
import { Ticket, Copy, Check, ExternalLink, Clock, Sparkles } from 'lucide-react';

interface CouponCardProps {
  cupom: Cupom;
}

export const CouponCard: React.FC<CouponCardProps> = ({ cupom }) => {
  const [copied, setCopied] = useState(false);

  const formatLink = (rawUrl?: string | null): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleCopy = () => {
    if (cupom.codigo) {
      try {
        navigator.clipboard.writeText(cupom.codigo);
      } catch (err) {
        console.error('Clipboard error:', err);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      const linkToOpen = formatLink(cupom.link) || formatLink(cupom.patrocinador?.link);
      if (linkToOpen) {
        window.open(linkToOpen, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleOpenLink = () => {
    const linkToOpen = formatLink(cupom.link) || formatLink(cupom.patrocinador?.link);
    if (linkToOpen) {
      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedExpiry = cupom.expira_em
    ? new Date(cupom.expira_em).toLocaleDateString('pt-BR')
    : null;

  return (
    <Card className="flex flex-col justify-between h-full border border-orange-200/80 dark:border-zinc-800 bg-gradient-to-b from-white via-orange-50/20 to-white dark:from-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      
      {/* Decorative Coupon Notch */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-50/80 dark:bg-zinc-950 border-r border-orange-200 dark:border-zinc-800" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-50/80 dark:bg-zinc-950 border-l border-orange-200 dark:border-zinc-800" />

      <div>
        {/* Header with Sponsor / Discount Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {cupom.patrocinador?.icone ? (
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-orange-200 bg-white shrink-0">
                <SignedImage path={cupom.patrocinador.icone} alt="Sponsor logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-600">
                <Ticket className="w-4 h-4" />
              </div>
            )}
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {cupom.patrocinador?.nome || 'Ofertas da Hora'}
            </span>
          </div>

          <Badge variant="discount">
            {cupom.desconto}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
          {cupom.titulo}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
          {cupom.descricao}
        </p>
      </div>

      <div>
        {/* Code Box */}
        <div className="mb-3 p-2.5 rounded-2xl bg-orange-100/70 dark:bg-zinc-800/90 border border-orange-300/80 dark:border-zinc-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="font-mono font-bold text-sm tracking-wider text-orange-950 dark:text-orange-200 select-all truncate">
              {cupom.codigo}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Expiry and External Link */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-dashed border-orange-200 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{formattedExpiry ? `Expira em ${formattedExpiry}` : 'Validez indeterminada'}</span>
          </div>

          {cupom.link && (
            <button
              onClick={handleOpenLink}
              className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1"
            >
              Usar Cupom <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
