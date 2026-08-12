import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Anuncio, Patrocinador, Cupom, SupabaseConfig } from '../types';
import { INITIAL_MOCK_ANUNCIOS, INITIAL_MOCK_PATROCINADORES, INITIAL_MOCK_CUPONS } from './mockData';

const CONFIG_KEY = 'ofertas_supabase_config';

export function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  // Strip trailing common API paths if user accidentally copied full endpoint
  cleaned = cleaned.replace(/\/(rest|auth|storage)\/v1\/?$/i, '');
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

export function getStoredConfig(): SupabaseConfig {
  const envUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: sanitizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey.trim(),
          isCustom: true
        };
      }
    }
  } catch (e) {
    console.error('Error loading stored Supabase config:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    isCustom: false
  };
}

export function saveConfig(url: string, anonKey: string) {
  try {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();
    localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
    );
    // Re-initialize client
    initSupabaseClient();
  } catch (e) {
    console.error('Error saving Supabase config:', e);
  }
}

export function clearConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
    initSupabaseClient();
  } catch (e) {
    console.error('Error clearing Supabase config:', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const config = getStoredConfig();
  const cleanUrl = sanitizeSupabaseUrl(config.url);
  const cleanKey = config.anonKey?.trim();

  if (cleanUrl && cleanKey) {
    try {
      supabaseInstance = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredConfig();
  return Boolean(config.url && config.anonKey);
}

// ----------------------------------------------------------------------
// LOCAL STORAGE DEMO STATE FOR FALLBACK MODE
// ----------------------------------------------------------------------
const DEMO_ANUNCIOS_KEY = 'ofertas_demo_anuncios';
const DEMO_PATROCINADORES_KEY = 'ofertas_demo_patrocinadores';
const DEMO_CUPONS_KEY = 'ofertas_demo_cupons';

function getLocalData<T>(key: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy mock items (like pat-1, anu-1, cup-1, etc.)
        const cleaned = parsed.filter((item: any) => {
          if (!item || !item.id) return false;
          const id = String(item.id);
          if (id.startsWith('pat-') || id.startsWith('anu-') || id.startsWith('cup-') || ['1', '2', '3', '4', '5', '6', '7', '8'].includes(id)) {
            return false;
          }
          return true;
        });
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error reading local demo data:', e);
  }
  return defaultData;
}

function saveLocalData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local demo data:', e);
  }
}

// Signed URL Memory Cache to minimize unnecessary API roundtrips
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Creates signed URLs for private 'anuncios' bucket paths.
 * Expiration: 24h (86400 seconds)
 */
export async function getSignedUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths || paths.length === 0) return {};

  const result: Record<string, string> = {};
  const pathsToFetch: string[] = [];
  const now = Date.now();

  for (const path of paths) {
    if (!path) continue;
    // If it's already an http/https URL (e.g. Unsplash mock images), return directly
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      result[path] = path;
      continue;
    }

    const cached = signedUrlCache.get(path);
    if (cached && cached.expiresAt > now + 60000) {
      result[path] = cached.url;
    } else {
      pathsToFetch.push(path);
    }
  }

  if (pathsToFetch.length === 0) {
    return result;
  }

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.storage
        .from('anuncios')
        .createSignedUrls(pathsToFetch, 86400);

      if (!error && data) {
        data.forEach((item, index) => {
          const originalPath = pathsToFetch[index];
          if (item.signedUrl) {
            result[originalPath] = item.signedUrl;
            signedUrlCache.set(originalPath, {
              url: item.signedUrl,
              expiresAt: now + 86400 * 1000
            });
          }
        });
      }
    } catch (e) {
      console.error('Error creating signed URLs in Supabase:', e);
    }
  }

  // Fallback for paths that failed to sign
  pathsToFetch.forEach(path => {
    if (!result[path]) {
      result[path] = path;
    }
  });

  return result;
}

/**
 * Helper to get a single signed URL
 */
export async function getSignedUrl(path: string): Promise<string> {
  if (!path) return '';
  const map = await getSignedUrls([path]);
  return map[path] || path;
}

// ----------------------------------------------------------------------
// DATA FETCHING & RPC SERVICES
// ----------------------------------------------------------------------

/**
 * Fetch all active or all anuncios
 */
export async function fetchAnuncios(includeInactive = false): Promise<Anuncio[]> {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from('anuncios').select('*, patrocinador:patrocinadores(*)');
      if (!includeInactive) {
        query = query.eq('ativo', true);
      }
      query = query.order('destaque', { ascending: false }).order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        return data as Anuncio[];
      }
      console.warn('Supabase query fetchAnuncios notice:', error?.message);
    } catch (e) {
      console.error('Failed to fetch anuncios from Supabase:', e);
    }
  }

  // Fallback demo mode
  const local = getLocalData<Anuncio>(DEMO_ANUNCIOS_KEY, INITIAL_MOCK_ANUNCIOS);
  const sponsors = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);

  return local
    .filter(a => includeInactive || a.ativo)
    .map(a => ({
      ...a,
      patrocinador: sponsors.find(s => s.id === a.patrocinador_id) || null
    }))
    .sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
}

/**
 * Fetch all patrocinadores
 */
export async function fetchPatrocinadores(includeInactive = false): Promise<Patrocinador[]> {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from('patrocinadores').select('*');
      if (!includeInactive) {
        query = query.eq('ativo', true);
      }
      query = query.order('ordem', { ascending: true });

      const { data, error } = await query;
      if (!error && data) {
        return data as Patrocinador[];
      }
    } catch (e) {
      console.error('Failed to fetch patrocinadores from Supabase:', e);
    }
  }

  const local = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);
  return local.filter(p => includeInactive || p.ativo).sort((a, b) => a.ordem - b.ordem);
}

/**
 * Fetch all cupons
 */
export async function fetchCupons(includeInactive = false): Promise<Cupom[]> {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from('cupons').select('*, patrocinador:patrocinadores(*)');
      if (!includeInactive) {
        query = query.eq('ativo', true);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        return data as Cupom[];
      }
    } catch (e) {
      console.error('Failed to fetch cupons from Supabase:', e);
    }
  }

  const local = getLocalData<Cupom>(DEMO_CUPONS_KEY, INITIAL_MOCK_CUPONS);
  const sponsors = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);

  return local
    .filter(c => includeInactive || c.ativo)
    .map(c => ({
      ...c,
      patrocinador: sponsors.find(s => s.id === c.patrocinador_id) || null
    }));
}

/**
 * RPC: registrar_clique (_id)
 */
export async function registrarClique(anuncioId: string): Promise<boolean> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.rpc('registrar_clique', { _id: anuncioId });
      if (!error) return true;
      console.warn('RPC registrar_clique returned error, falling back:', error.message);
    } catch (e) {
      console.error('Error invoking registrar_clique RPC:', e);
    }
  }

  // Fallback demo update
  const list = getLocalData<Anuncio>(DEMO_ANUNCIOS_KEY, INITIAL_MOCK_ANUNCIOS);
  const updated = list.map(item =>
    item.id === anuncioId ? { ...item, cliques: (item.cliques || 0) + 1 } : item
  );
  saveLocalData(DEMO_ANUNCIOS_KEY, updated);
  return true;
}

/**
 * RPC: registrar_clique_patrocinador (_id)
 */
export async function registrarCliquePatrocinador(patrocinadorId: string): Promise<boolean> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.rpc('registrar_clique_patrocinador', { _id: patrocinadorId });
      if (!error) return true;
    } catch (e) {
      console.error('Error invoking registrar_clique_patrocinador RPC:', e);
    }
  }

  const list = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);
  const updated = list.map(item =>
    item.id === patrocinadorId ? { ...item, cliques: (item.cliques || 0) + 1 } : item
  );
  saveLocalData(DEMO_PATROCINADORES_KEY, updated);
  return true;
}

/**
 * Automatically grants 'admin' role in user_roles table for specific admin emails like welington.ceolin@gmail.com
 */
export async function ensureAdminRoleForUser(userId: string, email?: string): Promise<boolean> {
  const client = getSupabase();
  if (!client || !userId) return false;

  const isAdminEmail = email?.toLowerCase() === 'welington.ceolin@gmail.com';

  if (isAdminEmail) {
    try {
      const { error } = await client.from('user_roles').upsert(
        [
          {
            user_id: userId,
            role: 'admin'
          }
        ],
        { onConflict: 'user_id,role' }
      );

      if (error) {
        await client.from('user_roles').insert([
          {
            user_id: userId,
            role: 'admin'
          }
        ]);
      }
      return true;
    } catch (e) {
      console.warn('Notice while ensuring user_roles entry:', e);
    }
  }
  return false;
}

/**
 * RPC: has_role (_user_id, _role)
 */
export async function checkHasRole(userId: string, role = 'admin', email?: string): Promise<boolean> {
  if (email?.toLowerCase() === 'welington.ceolin@gmail.com') {
    ensureAdminRoleForUser(userId, email);
    return true;
  }

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.rpc('has_role', {
        _user_id: userId,
        _role: role
      });
      if (!error && typeof data === 'boolean') {
        return data;
      }

      // Fallback table check
      const { data: rolesData, error: rolesError } = await client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();

      if (!rolesError && rolesData) {
        return true;
      }
    } catch (e) {
      console.error('Error checking user role:', e);
    }
  }

  // Demo admin fallback mode (if user enters admin credentials or testing demo)
  return true;
}

/**
 * Upload file to private 'anuncios' storage bucket
 */
export async function uploadAnuncioImage(file: File): Promise<string> {
  const client = getSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  if (client) {
    try {
      const { error } = await client.storage.from('anuncios').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (!error) {
        return filePath;
      }
      console.error('Error uploading to Supabase storage:', error.message);
    } catch (e) {
      console.error('Supabase storage upload exception:', e);
    }
  }

  // Demo fallback image preview data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// CRUD MUTATIONS (ANUNCIOS, PATROCINADORES, CUPONS)
// ----------------------------------------------------------------------

export async function createAnuncio(data: Omit<Anuncio, 'id' | 'cliques' | 'created_at' | 'updated_at'>): Promise<Anuncio> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { patrocinador, ...cleanData } = data as any;
      const payload = {
        ...cleanData,
        cliques: 0,
        updated_at: new Date().toISOString()
      };
      const { data: created, error } = await client.from('anuncios').insert([payload]).select('*, patrocinador:patrocinadores(*)').single();
      if (!error && created) {
        return created as Anuncio;
      }
      console.warn('Supabase insert anuncio warning, using local storage fallback:', error?.message);
    } catch (e) {
      console.error('Create anuncio exception, using fallback:', e);
    }
  }

  const list = getLocalData<Anuncio>(DEMO_ANUNCIOS_KEY, INITIAL_MOCK_ANUNCIOS);
  const newItem: Anuncio = {
    ...data,
    id: `anu-${Date.now()}`,
    cliques: 0,
    created_at: new Date().toISOString()
  };
  saveLocalData(DEMO_ANUNCIOS_KEY, [newItem, ...list]);
  return newItem;
}

export async function updateAnuncio(id: string, data: Partial<Anuncio>): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      // Remove joined properties before updating table
      const { patrocinador, ...cleanPayload } = data as any;
      const { error } = await client
        .from('anuncios')
        .update({ ...cleanPayload, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return true;
      console.warn('Supabase update anuncio warning, updating local storage:', error?.message);
    } catch (e) {
      console.error('Update anuncio exception:', e);
    }
  }

  const list = getLocalData<Anuncio>(DEMO_ANUNCIOS_KEY, INITIAL_MOCK_ANUNCIOS);
  const updated = list.map(item => (item.id === id ? { ...item, ...data } : item));
  saveLocalData(DEMO_ANUNCIOS_KEY, updated);
  return true;
}

export async function deleteAnuncio(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { error } = await client.from('anuncios').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase delete anuncio warning, deleting from local storage:', error?.message);
    } catch (e) {
      console.error('Delete anuncio exception:', e);
    }
  }

  const list = getLocalData<Anuncio>(DEMO_ANUNCIOS_KEY, INITIAL_MOCK_ANUNCIOS);
  saveLocalData(DEMO_ANUNCIOS_KEY, list.filter(a => a.id !== id));
  return true;
}

// Patrocinadores CRUD
export async function createPatrocinador(data: Omit<Patrocinador, 'id' | 'cliques' | 'created_at' | 'updated_at'>): Promise<Patrocinador> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const payload = { ...data, cliques: 0, updated_at: new Date().toISOString() };
      const { data: created, error } = await client.from('patrocinadores').insert([payload]).select().single();
      if (!error && created) return created as Patrocinador;
      console.warn('Supabase insert patrocinador warning:', error?.message);
    } catch (e) {
      console.error('Create patrocinador exception:', e);
    }
  }

  const list = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);
  const newItem: Patrocinador = { ...data, id: `pat-${Date.now()}`, cliques: 0, created_at: new Date().toISOString() };
  saveLocalData(DEMO_PATROCINADORES_KEY, [newItem, ...list]);
  return newItem;
}

export async function updatePatrocinador(id: string, data: Partial<Patrocinador>): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { error } = await client.from('patrocinadores').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Update patrocinador exception:', e);
    }
  }

  const list = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);
  saveLocalData(DEMO_PATROCINADORES_KEY, list.map(p => p.id === id ? { ...p, ...data } : p));
  return true;
}

export async function deletePatrocinador(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { error } = await client.from('patrocinadores').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Delete patrocinador exception:', e);
    }
  }

  const list = getLocalData<Patrocinador>(DEMO_PATROCINADORES_KEY, INITIAL_MOCK_PATROCINADORES);
  saveLocalData(DEMO_PATROCINADORES_KEY, list.filter(p => p.id !== id));
  return true;
}

// Cupons CRUD
export async function createCupom(data: Omit<Cupom, 'id' | 'created_at' | 'updated_at'>): Promise<Cupom> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { patrocinador, ...clean } = data as any;
      const payload = { ...clean, updated_at: new Date().toISOString() };
      const { data: created, error } = await client.from('cupons').insert([payload]).select('*, patrocinador:patrocinadores(*)').single();
      if (!error && created) return created as Cupom;
    } catch (e) {
      console.error('Create cupom exception:', e);
    }
  }

  const list = getLocalData<Cupom>(DEMO_CUPONS_KEY, INITIAL_MOCK_CUPONS);
  const newItem: Cupom = { ...data, id: `cup-${Date.now()}`, created_at: new Date().toISOString() };
  saveLocalData(DEMO_CUPONS_KEY, [newItem, ...list]);
  return newItem;
}

export async function updateCupom(id: string, data: Partial<Cupom>): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { patrocinador, ...clean } = data as any;
      const { error } = await client.from('cupons').update({ ...clean, updated_at: new Date().toISOString() }).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Update cupom exception:', e);
    }
  }

  const list = getLocalData<Cupom>(DEMO_CUPONS_KEY, INITIAL_MOCK_CUPONS);
  saveLocalData(DEMO_CUPONS_KEY, list.map(c => c.id === id ? { ...c, ...data } : c));
  return true;
}

export async function deleteCupom(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client && isSupabaseConfigured()) {
    try {
      const { error } = await client.from('cupons').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Delete cupom exception:', e);
    }
  }

  const list = getLocalData<Cupom>(DEMO_CUPONS_KEY, INITIAL_MOCK_CUPONS);
  saveLocalData(DEMO_CUPONS_KEY, list.filter(c => c.id !== id));
  return true;
}
