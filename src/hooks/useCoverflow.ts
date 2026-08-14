import { useCallback, useEffect, useRef, useState } from 'react';

export interface CoverflowItemStyle {
  transform: string;
  opacity: number;
  zIndex: number;
  filter?: string;
}

/**
 * Hook para criar um efeito de carrossel "coverflow": o item mais próximo do
 * centro do container fica em tamanho normal e em primeiro plano, enquanto os
 * itens vizinhos ficam menores, mais transparentes, desfocados e "atrás" (z-index menor).
 *
 * Uso: aplique `containerRef` no elemento com overflow-x-auto + scroll-snap,
 * e `setItemRef(index)` em cada card. `styles[index]` retorna o estilo inline
 * a aplicar em cada card.
 */
export function useCoverflow(count: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [styles, setStyles] = useState<CoverflowItemStyle[]>(
    Array.from({ length: count }, () => ({
      transform: 'scale(1)',
      opacity: 1,
      zIndex: 1,
      filter: 'none',
    }))
  );

  const update = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    const newStyles = itemRefs.current.map((el) => {
      if (!el) return { transform: 'scale(1)', opacity: 1, zIndex: 1, filter: 'none' };
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(itemCenter - centerX);
      const normalized = Math.min(distance / (containerRect.width / 2 || 1), 1);
      const scale = 1 - normalized * 0.18;
      const opacity = 1 - normalized * 0.25;
      const blurPx = (normalized * 1.2).toFixed(1);
      const zIndex = Math.round((1 - normalized) * 10);
      return {
        transform: `scale(${scale.toFixed(3)})`,
        opacity: Math.max(opacity, 0.72),
        filter: normalized > 0.2 ? `blur(${blurPx}px)` : 'none',
        zIndex,
      };
    });
    setStyles(newStyles);
  }, []);

  useEffect(() => {
    update();
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update, count]);

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  return { containerRef, setItemRef, styles, recompute: update };
}
