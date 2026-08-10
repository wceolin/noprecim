import { getSupabase } from './supabase';

export interface SocialConfig {
  whatsappNumero: string;
  whatsappMensagem: string;
  telegramLink: string;
  instagramHandle: string;
  tiktokLink: string;
}

const SOCIAL_CONFIG_KEY = 'ofertas_social_config';

export const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  whatsappNumero: '5511999999999',
  whatsappMensagem: 'Olá! Vim pelo site Ofertas da Hora e gostaria de tirar uma dúvida.',
  telegramLink: 'https://t.me/ofertasdahora',
  instagramHandle: '@ofertasdahoraoficial',
  tiktokLink: 'https://tiktok.com/@ofertasdahora'
};

/**
 * Get social configuration synchronously from localStorage fallback or initial state
 */
export function getSocialConfig(): SocialConfig {
  try {
    const saved = localStorage.getItem(SOCIAL_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_SOCIAL_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading social config from localStorage:', e);
  }
  return DEFAULT_SOCIAL_CONFIG;
}

/**
 * Fetch social config asynchronously from Supabase `configuracoes` table (key: 'social_config')
 */
export async function fetchSocialConfigFromDb(): Promise<SocialConfig> {
  const local = getSocialConfig();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'social_config')
        .maybeSingle();

      if (!error && data?.valor) {
        const parsed = typeof data.valor === 'string' ? JSON.parse(data.valor) : data.valor;
        const merged = { ...DEFAULT_SOCIAL_CONFIG, ...parsed };
        localStorage.setItem(SOCIAL_CONFIG_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Configuracoes table fetch notice:', e);
    }
  }

  return local;
}

/**
 * Save social config both to Supabase `configuracoes` table and localStorage
 */
export async function saveSocialConfig(config: Partial<SocialConfig>): Promise<SocialConfig> {
  const current = getSocialConfig();
  const updated: SocialConfig = { ...current, ...config };

  // Save to localStorage immediately
  try {
    localStorage.setItem(SOCIAL_CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving local social config:', e);
  }

  // Attempt save to Supabase
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from('configuracoes').upsert(
        [
          {
            chave: 'social_config',
            valor: JSON.stringify(updated),
            updated_at: new Date().toISOString()
          }
        ],
        { onConflict: 'chave' }
      );

      if (error) {
        console.warn('Upsert to configuracoes table failed, using localStorage fallback:', error.message);
      }
    } catch (e) {
      console.error('Save to configuracoes exception:', e);
    }
  }

  return updated;
}

export function buildWhatsAppLink(customConfig?: SocialConfig): string {
  const cfg = customConfig || getSocialConfig();
  const cleanNumber = cfg.whatsappNumero.replace(/\D/g, '');
  const encodedText = encodeURIComponent(cfg.whatsappMensagem);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
