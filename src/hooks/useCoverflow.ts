import { useCallback, useEffect, useRef, useState } from 'react';

export interface CoverflowItemStyle {
  transform: string;
  opacity: number;
  zIndex: number;
  filter?: string;
}

/**
 * Hook para criar um efeito de carrossel "coverflow" hiperfluido (60/120fps):
 * O item no centro fica em tamanho normal e em primeiro plano, enquanto os
 * itens laterais ficam suavemente menores, com opacidade e leve desfoque.
 * 
 * Utiliza atualização direta no DOM via requestAnimationFrame com aceleração GPU,
 * garantindo resposta instantânea ao toque e rolagem contínua sem travamentos.
 */
export function useCoverflow(count: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [styles] = useState<CoverflowItemStyle[]>(() =>
    Array.from({ length: count }, () => ({
      transform: 'scale3d(1, 1, 1)',
      opacity: 1,
      zIndex: 1,
      filter: 'none',
    }))
  );

  const applyStylesDirectly = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const halfWidth = containerRect.width / 2;
    if (!halfWidth) return;
    const centerX = containerRect.left + halfWidth;

    const len = itemRefs.current.length;
    for (let i = 0; i < len; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(itemCenter - centerX);
      const normalized = Math.min(distance / halfWidth, 1);

      // Curva suave e natural de escala e opacidade
      const scale = 1 - normalized * 0.18;
      const opacity = Math.max(1 - normalized * 0.25, 0.72);
      const blurPx = normalized > 0.2 ? (normalized * 1.2).toFixed(1) : '0';
      const zIndex = Math.round((1 - normalized) * 10);

      // Atualização direta nas propriedades CSS aceleradas por GPU
      el.style.transform = `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;
      el.style.opacity = `${opacity.toFixed(3)}`;
      el.style.filter = normalized > 0.2 ? `blur(${blurPx}px)` : 'none';
      el.style.zIndex = `${zIndex}`;
    }
  }, []);

  useEffect(() => {
    applyStylesDirectly();
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let isTicking = false;

    const onScrollOrResize = () => {
      if (!isTicking) {
        isTicking = true;
        rafId = requestAnimationFrame(() => {
          applyStylesDirectly();
          isTicking = false;
        });
      }
    };

    container.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Atualização pós-renderização para garantir sincronia inicial
    const timeoutId = setTimeout(applyStylesDirectly, 60);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [applyStylesDirectly, count]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  return { containerRef, setItemRef, styles, recompute: applyStylesDirectly };
}
