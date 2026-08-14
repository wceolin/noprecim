import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useCoverflow } from './useCoverflow';

export interface InfiniteItem<T> {
  extIndex: number;
  realIndex: number;
  item: T;
}

/**
 * Envolve o useCoverflow com rolagem infinita: duplica os primeiros/últimos
 * itens nas pontas da lista (clones invisíveis) e, assim que o usuário rola
 * para dentro da zona de clone, "teleporta" a rolagem de volta para o item
 * real correspondente sem nenhuma animação perceptível — dando a sensação de
 * loop contínuo nos dois sentidos.
 */
export function useInfiniteCoverflow<T>(items: T[] = []) {
  const count = items.length;
  const cloneCount = Math.min(2, count);
  const coverflow = useCoverflow(count + cloneCount * 2);
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didInit = useRef(false);

  const extendedItems: InfiniteItem<T>[] = [];
  if (count > 0) {
    for (let i = 0; i < cloneCount; i++) {
      const realIndex = count - cloneCount + i;
      extendedItems.push({ extIndex: i, realIndex, item: items[realIndex] });
    }
    for (let i = 0; i < count; i++) {
      extendedItems.push({ extIndex: cloneCount + i, realIndex: i, item: items[i] });
    }
    for (let i = 0; i < cloneCount; i++) {
      extendedItems.push({ extIndex: cloneCount + count + i, realIndex: i, item: items[i] });
    }
  }

  const setItemRef = useCallback(
    (extIndex: number) => (el: HTMLDivElement | null) => {
      elRefs.current[extIndex] = el;
      coverflow.setItemRef(extIndex)(el);
    },
    [coverflow]
  );

  const getActiveExtIndex = useCallback((): number | null => {
    const container = coverflow.containerRef.current;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    let best: number | null = null;
    let bestDist = Infinity;
    elRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    return best;
  }, [coverflow.containerRef]);

  // Centraliza no primeiro item real ao montar (instantâneo, sem animação visível)
  useLayoutEffect(() => {
    if (didInit.current || count === 0) return;
    const el = elRefs.current[cloneCount];
    if (el) {
      el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
      didInit.current = true;
    }
  }, [count, cloneCount]);

  // Corrige (teleporta) a rolagem assim que ela entra na zona de clone
  useEffect(() => {
    const container = coverflow.containerRef.current;
    if (!container || count === 0) return;

    let settleTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const activeExt = getActiveExtIndex();
        if (activeExt === null) return;
        let targetExt: number | null = null;
        if (activeExt < cloneCount) {
          targetExt = activeExt + count;
        } else if (activeExt >= cloneCount + count) {
          targetExt = activeExt - count;
        }
        if (targetExt !== null) {
          const targetEl = elRefs.current[targetExt];
          if (targetEl) {
            targetEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
          }
        }
      }, 120);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [coverflow.containerRef, count, cloneCount, getActiveExtIndex]);

  return {
    containerRef: coverflow.containerRef,
    setItemRef,
    styles: coverflow.styles,
    extendedItems,
  };
}
