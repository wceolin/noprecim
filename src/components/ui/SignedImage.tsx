import React, { useEffect, useState } from 'react';
import { getSignedUrl } from '../../lib/supabase';
import { ImageOff } from 'lucide-react';

export interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string;
  fallbackSrc?: string;
  className?: string;
}

export const SignedImage: React.FC<SignedImageProps> = ({
  path,
  fallbackSrc = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=600&q=80',
  className = '',
  alt = 'Imagem do produto',
  ...props
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function loadUrl() {
      if (!path) {
        if (active) {
          setResolvedUrl(fallbackSrc);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const url = await getSignedUrl(path);
        if (active) {
          setResolvedUrl(url || fallbackSrc);
        }
      } catch (err) {
        if (active) {
          console.error('Error fetching signed image URL:', err);
          setError(true);
          setResolvedUrl(fallbackSrc);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUrl();

    return () => {
      active = false;
    };
  }, [path, fallbackSrc]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center ${className}`}>
        <span className="sr-only">Carregando imagem...</span>
      </div>
    );
  }

  if (error || !resolvedUrl) {
    return (
      <div className={`bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-4 text-zinc-400 rounded-xl ${className}`}>
        <ImageOff className="w-6 h-6 mb-1 opacity-60" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Sem Imagem</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
        setResolvedUrl(fallbackSrc);
      }}
      {...props}
    />
  );
};
