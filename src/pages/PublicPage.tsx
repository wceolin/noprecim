import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAnuncios, fetchPatrocinadores, fetchCupons } from '../lib/supabase';
import { Anuncio } from '../types';
import { Header } from '../components/public/Header';
import { CategoryFilter } from '../components/public/CategoryFilter';
import { SponsorCarousel } from '../components/public/SponsorCarousel';
import { FeaturedDealsCarousel } from '../components/public/FeaturedDealsCarousel';
import { AnuncioCard } from '../components/public/AnuncioCard';
import { CouponCard } from '../components/public/CouponCard';
import { DealDetailModal } from '../components/public/DealDetailModal';
import { FloatingButtons } from '../components/public/FloatingButtons';
import { Footer } from '../components/public/Footer';
import { SupabaseConfigModal } from '../components/ui/SupabaseConfigModal';
import { Flame, Tag, Filter, AlertCircle } from 'lucide-react';

interface PublicPageProps {
  onNavigateAdmin: () => void;
}

export const PublicPage: React.FC<PublicPageProps> = ({ onNavigateAdmin }) => {
  const [activeTab, setActiveTab] = useState<'ofertas' | 'cupons'>('ofertas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'novos' | 'populares' | 'preco_menor'>('novos');

  // React Query cached data fetching
  const {
    data: anuncios = [],
    isLoading: loadingAnuncios,
    refetch: refetchAnuncios
  } = useQuery({
    queryKey: ['anuncios'],
    queryFn: () => fetchAnuncios(false),
    staleTime: 1000 * 30
  });

  const {
    data: patrocinadores = []
  } = useQuery({
    queryKey: ['patrocinadores'],
    queryFn: () => fetchPatrocinadores(false),
    staleTime: 1000 * 60 * 2
  });

  const {
    data: cupons = []
  } = useQuery({
    queryKey: ['cupons'],
    queryFn: () => fetchCupons(false),
    staleTime: 1000 * 60 * 2
  });

  // Filter & Sort logic for Deals
  const filteredAnuncios = anuncios
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'Todos' || item.categoria === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.cupom && item.cupom.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categoria && item.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'novos') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'populares') {
        return (b.cliques || 0) - (a.cliques || 0);
      }
      if (sortBy === 'preco_menor') {
        const pA = parseFloat(a.preco.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
        const pB = parseFloat(b.preco.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
        return pA - pB;
      }
      return 0;
    });

  // Featured deals filtered subset
  const featuredDeals = filteredAnuncios.filter((a) => Boolean(a.destaque));

  // Coupons search filter
  const filteredCupons = cupons.filter((cupom) => {
    return (
      searchQuery === '' ||
      cupom.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cupom.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cupom.desconto.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      
      {/* Sticky Header with Glassmorphism */}
      <Header
        onOpenConfig={() => setIsConfigOpen(true)}
        onNavigateAdmin={onNavigateAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* HERO: Sponsor Carousel */}
        <SponsorCarousel sponsors={patrocinadores} cupons={cupons} />

        {/* Category Filters Pill Strip */}
        <div className="my-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Tab 1: Ofertas */}
        {activeTab === 'ofertas' && (
          <div className="space-y-8">
            
            {/* Featured Deals Carousel (Only shown if featured deals exist in filtered list) */}
            {featuredDeals.length > 0 && (
              <FeaturedDealsCarousel
                featuredDeals={featuredDeals}
                onSelectDeal={(deal) => setSelectedAnuncio(deal)}
              />
            )}

            {/* Section Header for All Deals */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-orange-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    {selectedCategory === 'Todos' ? 'Todas as Ofertas' : `Ofertas de ${selectedCategory}`}
                  </h2>
                  <span className="text-xs font-bold text-zinc-500 bg-orange-100/80 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                    {filteredAnuncios.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Filter className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-2xl border border-orange-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="novos">Mais Recentes</option>
                    <option value="populares">Mais Clicados</option>
                    <option value="preco_menor">Menor Preço</option>
                  </select>
                </div>
              </div>

              {/* Grid of All Deals */}
              {loadingAnuncios ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-white dark:bg-zinc-900 rounded-[24px] p-4 h-80 border border-orange-100 dark:border-zinc-800"
                    />
                  ))}
                </div>
              ) : filteredAnuncios.length === 0 ? (
                <div className="text-center py-16 px-4 my-6 bg-white/60 dark:bg-zinc-900/60 rounded-[24px] border border-orange-100 dark:border-zinc-800 space-y-3">
                  <AlertCircle className="w-10 h-10 mx-auto text-orange-400 opacity-60" />
                  <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                    Nenhuma oferta encontrada
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Tente ajustar sua busca ou selecionar outra categoria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {filteredAnuncios.map((anuncio, index) => (
                    <AnuncioCard
                      key={anuncio.id}
                      anuncio={anuncio}
                      index={index}
                      onSelect={(a) => setSelectedAnuncio(a)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Cupons e Promoções */}
        {activeTab === 'cupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  Cupons & Códigos de Desconto
                </h2>
                <span className="text-xs font-bold text-zinc-500 bg-orange-100/80 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                  {filteredCupons.length}
                </span>
              </div>
            </div>

            {filteredCupons.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/60 dark:bg-zinc-900/60 rounded-[24px] border border-orange-100 dark:border-zinc-800 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-orange-400 opacity-60" />
                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                  Nenhum cupom ativo encontrado
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredCupons.map((cupom) => (
                  <CouponCard key={cupom.id} cupom={cupom} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating Buttons: WhatsApp & Scroll To Top */}
      <FloatingButtons />

      {/* Deal Detail Modal */}
      <DealDetailModal
        anuncio={selectedAnuncio}
        onClose={() => setSelectedAnuncio(null)}
      />

      {/* Supabase Connection Modal */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => {
          refetchAnuncios();
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
