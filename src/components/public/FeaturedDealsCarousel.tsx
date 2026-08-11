import React from 'react';
import { Anuncio } from '../../types';
import { AnuncioCard } from './AnuncioCard';
import { Flame } from 'lucide-react';

interface FeaturedDealsCarouselProps {
  featuredDeals: Anuncio[];
  onSelectDeal: (deal: Anuncio) => void;
}

export const FeaturedDealsCarousel: React.FC<FeaturedDealsCarouselProps> = ({
  featuredDeals,
  onSelectDeal
}) => {
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
        {/* Removed Super Ofertas Selecionadas span */}
      </div>

      {/* Horizontal Carousel Roll with exact same AnuncioCard styling */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {featuredDeals.map((deal, idx) => (
          <div key={deal.id} className="shrink-0 w-72 sm:w-80 flex flex-col">
            <AnuncioCard
              anuncio={deal}
              onSelect={onSelectDeal}
              index={idx}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

