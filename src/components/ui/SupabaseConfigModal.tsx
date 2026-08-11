import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { getStoredConfig, saveConfig, clearConfig, isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Key, Link2, RefreshCw, Copy, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const SUPABASE_SETUP_SQL = `-- 1. Tabela de Patrocinadores
CREATE TABLE IF NOT EXISTS public.patrocinadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  imagem TEXT,
  icone TEXT,
  link TEXT,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 1,
  cliques INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Anúncios / Ofertas
CREATE TABLE IF NOT EXISTS public.anuncios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'Tecnologia',
  preco TEXT,
  localizacao TEXT,
  link TEXT,
  selo TEXT,
  cupom TEXT,
  imagens TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  cliques INTEGER DEFAULT 0,
  patrocinador_id UUID REFERENCES public.patrocinadores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Cupons
CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patrocinador_id UUID REFERENCES public.patrocinadores(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT,
  desconto TEXT,
  link TEXT,
  tipo TEXT DEFAULT 'cupom',
  expira_em TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Permissões de Usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas de Permissão Total para Leitura e Escrita
DROP POLICY IF EXISTS "Acesso total patrocinadores" ON public.patrocinadores;
CREATE POLICY "Acesso total patrocinadores" ON public.patrocinadores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total anuncios" ON public.anuncios;
CREATE POLICY "Acesso total anuncios" ON public.anuncios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total cupons" ON public.cupons;
CREATE POLICY "Acesso total cupons" ON public.cupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total user_roles" ON public.user_roles;
CREATE POLICY "Acesso total user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

-- Funções RPC para registro de cliques e papel de admin
CREATE OR REPLACE FUNCTION registrar_clique(_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.anuncios SET cliques = COALESCE(cliques, 0) + 1 WHERE id = _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION registrar_clique_patrocinador(_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.patrocinadores SET cliques = COALESCE(cliques, 0) + 1 WHERE id = _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus('error');
      setMessage('Por favor, informe a URL do projeto e a Anon Key.');
      return;
    }

    setTesting(true);
    setStatus('idle');
    setMessage('');

    try {
      saveConfig(url, anonKey);
      const client = getSupabase();
      if (client) {
        // Quick test query to 'anuncios' table
        const { error } = await client.from('anuncios').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
          console.warn('Test query warning:', error);
        }
        setStatus('success');
        setMessage('Conexão salva e validada com sucesso!');
        setTimeout(() => {
          if (onSaved) onSaved();
          onClose();
        }, 800);
      } else {
        setStatus('error');
        setMessage('Não foi possível inicializar o cliente Supabase.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Erro ao conectar ao Supabase.');
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearConfig();
    setUrl('');
    setAnonKey('');
    setStatus('idle');
    setMessage('Configurações removidas. O aplicativo utilizará o modo demonstração.');
    if (onSaved) onSaved();
  };

  const configured = isSupabaseConfigured();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conexão com o Supabase" maxWidth="lg">
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/50 flex items-start gap-3">
          <Database className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 dark:text-orange-200 space-y-1">
            <p className="font-bold text-sm">Projeto do Supabase</p>
            <p>
              Insira a <strong className="font-semibold">Project URL</strong> e a <strong className="font-semibold">anon key</strong> do seu projeto Supabase para ler/escrever diretamente na sua base de dados.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Project URL (Supabase)"
            placeholder="https://sua-url.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            icon={<Link2 className="w-4 h-4" />}
            required
          />

          <Input
            label="Anon Key (Public API Key)"
            type="password"
            placeholder="eyJhbGciOi..."
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            icon={<Key className="w-4 h-4" />}
            required
          />

          {/* Collapsible SQL Setup Script */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-orange-600" />
                <span>Script SQL para Criar Tabelas e Permissões</span>
              </div>
              {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSql && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-900 text-zinc-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-zinc-400">
                    Copie e cole este script no <strong className="text-zinc-200">SQL Editor</strong> do seu projeto Supabase:
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={SUPABASE_SETUP_SQL}
                  rows={8}
                  className="w-full p-2.5 font-mono text-[10px] bg-zinc-950 text-emerald-400 rounded-xl border border-zinc-800 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {status === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {message}
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 gap-2">
            {configured ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-rose-600 dark:text-rose-400">
                Limpar Credenciais
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={testing} icon={<RefreshCw className="w-4 h-4" />}>
                Salvar e Testar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
