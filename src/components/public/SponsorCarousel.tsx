import React, { useState, useRef, useEffect } from 'react';
import { Patrocinador, Cupom } from '../../types';
import { SignedImage } from '../ui/SignedImage';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { registrarCliquePatrocinador } from '../../lib/supabase';
import { Award, ExternalLink, Ticket, Copy, Check, Calendar, ArrowRight } from 'lucide-react';

interface SponsorCarouselProps {
  sponsors: Patrocinador[];
  cupons?: Cupom[];
}

export const SponsorCarousel: React.FC<SponsorCarouselProps> = ({ sponsors, cupons = [] }) => {
  const [selectedSponsor, setSelectedSponsor] = useState<Patrocinador | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!sponsors || sponsors.length === 0) return null;

  // Compute active non-expired coupons map per sponsor
  const now = new Date().toISOString();
  const getSponsorCoupons = (sponsorId: string): Cupom[] => {
    return cupons.filter((c) => {
      if (c.patrocinador_id !== sponsorId || !c.ativo) return false;
      if (c.expira_em && c.expira_em < now) return false;
      return true;
    });
  };

  const formatLink = (rawUrl?: string | null): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSponsorClick = (sponsor: Patrocinador) => {
    try {
      registrarCliquePatrocinador(sponsor.id);
    } catch (e) {
      console.error('Click error:', e);
    }
    const sponsorCoupons = getSponsorCoupons(sponsor.id);
    if (sponsorCoupons.length > 0) {
      setSelectedSponsor(sponsor);
    } else {
      const destinationLink = formatLink(sponsor.link);
      if (destinationLink) {
        window.open(destinationLink, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleCopyCode = (code: string, cupomLink?: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
    setCopiedCode(code);
    showToast(`Cupom ${code} copiado! Redirecionando...`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);

    const destinationLink = formatLink(selectedSponsor?.link) || formatLink(cupomLink);
    if (destinationLink) {
      window.open(destinationLink, '_blank', 'noopener,noreferrer');
    }
  };

  const activeSponsorCoupons = selectedSponsor ? getSponsorCoupons(selectedSponsor.id) : [];

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            PARCEIROS
          </h2>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Roll */}
      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {sponsors.map((sponsor) => {
          const sponsorCoupons = getSponsorCoupons(sponsor.id);
          const couponCount = sponsorCoupons.length;

          return (
            <div
              key={sponsor.id}
              onClick={() => handleSponsorClick(sponsor)}
              className="group cursor-pointer relative shrink-0 w-64 sm:w-72 overflow-hidden rounded-[22px] bg-white dark:bg-zinc-900 border border-orange-100/90 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Banner Image */}
              <div className="h-28 w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                <SignedImage
                  path={sponsor.imagem}
                  alt={sponsor.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

                {/* Coupon Count Badge if sponsor has coupons */}
                {couponCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 z-10 bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                    <Ticket className="w-3 h-3" />
                    <span>{couponCount} {couponCount === 1 ? 'cupom' : 'cupons'}</span>
                  </div>
                )}
              </div>

              {/* Logo & Info */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 bg-white shadow-md shrink-0">
                    <SignedImage
                      path={sponsor.icone}
                      alt={`${sponsor.nome} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors truncate">
                      {sponsor.nome}
                    </h3>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {sponsor.cliques || 0} acessos
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0 group-hover:underline">
                  {couponCount > 0 ? 'Ver cupons' : 'Visitar'} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal displaying Active Coupons for clicked Sponsor */}
      {selectedSponsor && (
        <Modal
          isOpen={Boolean(selectedSponsor)}
          onClose={() => setSelectedSponsor(null)}
          title={`Cupons de Desconto - ${selectedSponsor.nome}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-orange-50 dark:bg-zinc-800/80 border border-orange-200/80 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border shrink-0">
                <SignedImage path={selectedSponsor.icone} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedSponsor.nome}</h4>
                <p className="text-xs text-zinc-500 truncate">Cupons e códigos promocionais verificados</p>
              </div>
              {selectedSponsor.link && (
                <a
                  href={formatLink(selectedSponsor.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  Ir para Loja <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activeSponsorCoupons.length === 0 ? (
                <p className="text-center text-xs text-zinc-400 py-6">
                  Nenhum cupom ativo no momento para esta loja.
                </p>
              ) : (
                activeSponsorCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px]">
                          {c.desconto || 'Oferta'}
                        </span>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{c.titulo}</h5>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{c.descricao}</p>
                      {c.expira_em && (
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          Válido até: {new Date(c.expira_em).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        onClick={() => handleCopyCode(c.codigo, c.link)}
                        title="Clique para copiar e abrir a loja"
                        className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-dashed border-orange-300 text-orange-900 dark:text-orange-300 font-mono font-bold text-xs tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {c.codigo}
                      </div>
                      <button
                        onClick={() => handleCopyCode(c.codigo, c.link)}
                        className="p-2 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Copiar cupom e abrir loja"
                      >
                        {copiedCode === c.codigo ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
