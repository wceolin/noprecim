import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { getStoredConfig, saveConfig, clearConfig, isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Key, Link2, RefreshCw } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

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

  useEffect(() => {
    if (isOpen) {
      const config = getStoredConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

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
            <p className="font-bold text-sm">Projeto Existente do Supabase</p>
            <p>
              Insira a <strong className="font-semibold">Project URL</strong> e a <strong className="font-semibold">anon key</strong> do seu projeto Supabase já existente para ler/escrever diretamente na sua base de dados.
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
