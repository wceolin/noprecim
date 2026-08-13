import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  Laptop,
  Home,
  HeartPulse,
  Sparkle,
  Shirt,
  BookOpen,
  Wrench,
  Car
} from 'lucide-react';

export interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'Todos', label: 'Todos', icon: Sparkles },
  { id: 'Tecnologia', label: 'Tecnologia', icon: Laptop },
  { id: 'Casa', label: 'Casa', icon: Home },
  { id: 'Saúde', label: 'Saúde', icon: HeartPulse },
  { id: 'Beleza', label: 'Beleza', icon: Sparkle },
  { id: 'Moda', label: 'Moda', icon: Shirt },
  { id: 'Livros', label: 'Livros', icon: BookOpen },
  { id: 'Ferramentas', label: 'Ferramentas', icon: Wrench },
  { id: 'Automotiva', label: 'Automotiva', icon: Car },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
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

  return (
    <div ref={containerRef} className="w-full overflow-x-auto no-scrollbar py-2 my-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 text-white border-transparent shadow-md shadow-orange-500/20 scale-[1.02]'
                  : 'bg-white/80 dark:bg-zinc-900/80 border-orange-100/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-zinc-800/80'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
