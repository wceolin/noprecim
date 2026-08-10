import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ShieldCheck, UserPlus, KeyRound, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface AdminRoleRow {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
}

export const AdminRolesManager: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<AdminRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('user_roles')
          .select('*')
          .eq('role', 'admin');

        if (!error && data) {
          setAdmins(data as AdminRoleRow[]);
        }
      } catch (e) {
        console.error('Error fetching admin roles:', e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setAdding(true);
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client
          .from('user_roles')
          .insert([{ user_id: newUserId.trim(), role: 'admin' }]);

        if (!error) {
          showToast('Novo administrador adicionado!', 'success');
          setNewUserId('');
          fetchAdmins();
        } else {
          showToast(error.message, 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao adicionar administrador', 'error');
      }
    } else {
      showToast('Supabase não conectado. Conecte o banco de dados primeiro.', 'error');
    }
    setAdding(false);
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirm('Remover esta permissão de administrador?')) return;

    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('user_roles').delete().eq('id', id);
        if (!error) {
          showToast('Permissão removida.', 'success');
          fetchAdmins();
        } else {
          showToast(error.message, 'error');
        }
      } catch (e: any) {
        showToast(e.message || 'Erro ao remover', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          <span>Gerenciar Administradores do Sistema</span>
        </h2>
        <p className="text-xs text-zinc-500">
          Apenas usuários listados na tabela <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">user_roles</code> com role <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">admin</code> possuem acesso ao painel administrativo.
        </p>
      </div>

      {/* Current Logged User Info */}
      <div className="p-4 rounded-2xl bg-orange-50 dark:bg-zinc-800/80 border border-orange-200/80 dark:border-zinc-700 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 block">
            Usuário Logado Atual:
          </span>
          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-0.5">
            {user?.email || 'Admin Demo'}
          </p>
          <p className="text-[10px] font-mono text-zinc-400">ID: {user?.id}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
          Role: Admin Ativo
        </span>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleAddAdmin} className="bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-orange-600" />
          <span>Adicionar Novo Administrador por User ID</span>
        </h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="UUID do usuário do Supabase Auth (ex: 8f24a1b0-c081-...)"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" isLoading={adding}>
            Conceder Admin
          </Button>
        </div>
      </form>

      {/* Admin Roles List */}
      <div className="bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-orange-600" />
            <span>Administradores Cadastrados ({admins.length})</span>
          </h3>

          <button
            onClick={fetchAdmins}
            className="p-1.5 rounded-xl hover:bg-orange-50 text-zinc-500 text-xs flex items-center gap-1 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-zinc-400 py-4 text-center">Carregando permissões...</p>
        ) : admins.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400 space-y-1">
            <AlertCircle className="w-6 h-6 mx-auto opacity-50 text-orange-400" />
            <p>Nenhuma entrada explícita na tabela user_roles ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {admins.map((adm) => (
              <div key={adm.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    User ID: {adm.user_id}
                  </p>
                  <span className="text-[10px] text-zinc-400">Role: {adm.role}</span>
                </div>

                <button
                  onClick={() => handleRemoveAdmin(adm.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800"
                  title="Remover acesso admin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
