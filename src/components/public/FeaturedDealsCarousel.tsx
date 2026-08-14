import React, { useRef, useEffect } from 'react';
import { Anuncio } from '../../types';
import { AnuncioCard } from './AnuncioCard';
import { useInfiniteCoverflow } from '../../hooks/useInfiniteCoverflow';
import { Flame } from 'lucide-react';

interface FeaturedDealsCarouselProps {
  featuredDeals: Anuncio[];
  onSelectDeal: (deal: Anuncio) => void;
}

export const FeaturedDealsCarousel: React.FC<FeaturedDealsCarouselProps> = ({
  featuredDeals,
  onSelectDeal
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const coverflow = useInfiniteCoverflow<Anuncio>(featuredDeals);

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
  }, [featuredDeals]);

  if (!featuredDeals || featuredDeals.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Anúncios em Destaque
          </h2>
        </div>
      </div>

      {/* Horizontal Carousel Roll — DESKTOP (visual original, inalterado) */}
      <div ref={scrollContainerRef} className="hidden sm:flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1">
        {featuredDeals.map((deal, idx) => (
          <div key={deal.id} className="shrink-0 w-80 flex flex-col">
            <AnuncioCard
              anuncio={deal}
              onSelect={onSelectDeal}
              index={idx}
            />
          </div>
        ))}
      </div>

      {/* Coverflow Carousel — MOBILE (card central em destaque e maior, laterais menores, desfocados e atrás com loop infinito) */}
      <div
        ref={coverflow.containerRef}
        className="sm:hidden isolate relative z-0 flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 -mx-4 px-4"
        style={{ scrollPaddingLeft: '14%', scrollPaddingRight: '14%' }}
      >
        {coverflow.extendedItems.map(({ extIndex, realIndex, item: deal }) => {
          const style = coverflow.styles[extIndex] || {
            transform: 'scale(1)',
            opacity: 1,
            zIndex: 1,
            filter: 'none',
          };
          return (
            <div
              key={`${deal.id}-${extIndex}`}
              ref={coverflow.setItemRef(extIndex)}
              style={{
                transform: style.transform,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: style.filter,
              }}
              className="snap-center shrink-0 w-[76%] mx-[-3.5%] transition-all duration-150 ease-out"
            >
              <AnuncioCard
                anuncio={deal}
                onSelect={onSelectDeal}
                index={realIndex}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
