import React, { useState } from 'react';
import { Cupom, Patrocinador } from '../../types';
import { createCupom, updateCupom, deleteCupom } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { SignedImage } from '../ui/SignedImage';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Edit2,
  Trash2,
  Ticket,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Award,
  Calendar
} from 'lucide-react';

interface CuponsManagerProps {
  cupons: Cupom[];
  patrocinadores: Patrocinador[];
  onRefresh: () => void;
}

export const CuponsManager: React.FC<CuponsManagerProps> = ({
  cupons,
  patrocinadores,
  onRefresh
}) => {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null);
  const [loading, setLoading] = useState(false);

  // Deleting confirmation state
  const [deletingCupom, setDeletingCupom] = useState<Cupom | null>(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [desconto, setDesconto] = useState('');
  const [link, setLink] = useState('');
  const [tipo, setTipo] = useState<'cupom' | 'promocao'>('cupom');
  const [expiraEm, setExpiraEm] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [patrocinadorId, setPatrocinadorId] = useState('');

  const openModal = (cupom?: Cupom) => {
    if (cupom) {
      setEditingCupom(cupom);
      setTitulo(cupom.titulo);
      setDescricao(cupom.descricao || '');
      setCodigo(cupom.codigo || '');
      setDesconto(cupom.desconto || '10% OFF');
      setLink(cupom.link || '');
      setTipo((cupom.tipo as any) || 'cupom');
      setExpiraEm(cupom.expira_em ? cupom.expira_em.split('T')[0] : '');
      setAtivo(cupom.ativo !== false);
      setPatrocinadorId(cupom.patrocinador_id || (patrocinadores[0]?.id || ''));
    } else {
      setEditingCupom(null);
      setTitulo('');
      setDescricao('');
      setCodigo('');
      setDesconto('15% OFF');
      setLink('https://');
      setTipo('cupom');
      setExpiraEm('');
      setAtivo(true);
      setPatrocinadorId(patrocinadores[0]?.id || '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCupom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patrocinadorId) {
      showToast('Selecione uma loja parceira / patrocinador para o cupom.', 'error');
      return;
    }

    setLoading(true);

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      codigo: codigo.trim(),
      desconto: desconto.trim(),
      link: link.trim(),
      tipo,
      expira_em: expiraEm ? new Date(`${expiraEm}T23:59:59`).toISOString() : null,
      ativo,
      patrocinador_id: patrocinadorId
    };

    try {
      if (editingCupom) {
        await updateCupom(editingCupom.id, payload);
        showToast('Cupom atualizado!', 'success');
      } else {
        await createCupom(payload);
        showToast('Cupom cadastrado com sucesso!', 'success');
      }
      onRefresh();
      closeModal();
    } catch (e: any) {
      showToast(e?.message || 'Erro ao salvar cupom', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCupom) return;
    try {
      await deleteCupom(deletingCupom.id);
      showToast('Cupom removido!', 'success');
      onRefresh();
      setDeletingCupom(null);
    } catch (err) {
      showToast('Erro ao excluir cupom', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-orange-600" />
            <span>Gerenciar Cupons e Promoções ({cupons.length})</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre cupons vinculados a lojas parceiras com sinalização de expiração.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => openModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Cupom
        </Button>
      </div>

      {/* Grid of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cupons.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 text-zinc-400">
            Nenhum cupom cadastrado.
          </div>
        ) : (
          cupons.map((cupom) => {
            const isExpired = Boolean(
              cupom.expira_em && new Date(cupom.expira_em) < new Date()
            );

            const sponsor = patrocinadores.find((p) => p.id === cupom.patrocinador_id) || cupom.patrocinador;

            return (
              <div
                key={cupom.id}
                className={`p-4 rounded-[22px] bg-white dark:bg-zinc-900 border shadow-sm flex flex-col justify-between transition-all ${
                  isExpired
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-orange-100 dark:border-zinc-800'
                }`}
              >
                <div>
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black text-orange-700 dark:text-orange-300 bg-orange-100/90 dark:bg-orange-950/80 px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3 text-orange-600" />
                      <span>{cupom.desconto}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Expired visual alert */}
                      {isExpired && (
                        <span className="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Expirado
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cupom.ativo !== false && !isExpired
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                        }`}
                      >
                        {cupom.ativo !== false ? (isExpired ? 'Inativo (Expirou)' : 'Ativo') : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                    {cupom.titulo}
                  </h3>

                  {cupom.descricao && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2">
                      {cupom.descricao}
                    </p>
                  )}

                  {/* Sponsor Tag */}
                  {sponsor && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-orange-50/60 dark:bg-zinc-800/60 p-2 rounded-xl">
                      <div className="w-5 h-5 rounded-lg overflow-hidden shrink-0 border bg-white">
                        <SignedImage path={sponsor.icone || sponsor.imagem} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{sponsor.nome}</span>
                    </div>
                  )}

                  {/* Code Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-orange-50 dark:bg-zinc-800/80 border border-dashed border-orange-300 dark:border-zinc-700 flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase font-bold">
                      {cupom.tipo === 'promocao' ? 'Promoção' : 'Cupom'}
                    </span>
                    <span className="font-extrabold text-orange-950 dark:text-orange-200">
                      {cupom.codigo || 'OFERTA AUTO-APLICADA'}
                    </span>
                  </div>

                  {/* Expiration date */}
                  {cupom.expira_em && (
                    <p className={`text-[11px] font-semibold mt-2 flex items-center gap-1 ${isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {isExpired ? 'Expirou em: ' : 'Expira em: '}
                        {new Date(cupom.expira_em).toLocaleDateString('pt-BR')}
                      </span>
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => openModal(cupom)}
                    className="p-1.5 rounded-xl text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCupom(cupom)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deletingCupom && (
        <Modal
          isOpen={Boolean(deletingCupom)}
          onClose={() => setDeletingCupom(null)}
          title="Excluir Cupom"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Excluir "{deletingCupom.titulo}"?</h4>
                <p className="text-[11px] mt-0.5">
                  Esta ação é permanente e removerá o cupom do catálogo do site.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDeletingCupom(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} icon={<Trash2 className="w-4 h-4" />}>
                Sim, Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCupom ? 'Editar Cupom / Promoção' : 'Cadastrar Novo Cupom'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <Input
            label="Título do Cupom ou Promoção"
            placeholder="Ex: Cupom de 20% OFF em todo o site"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          {/* Mandatory Sponsor Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Loja Parceira / Patrocinador (Obrigatório) *
            </label>
            <select
              value={patrocinadorId}
              onChange={(e) => setPatrocinadorId(e.target.value)}
              className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold"
              required
            >
              <option value="">-- Selecione uma loja parceira --</option>
              {patrocinadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Código Promocional"
              placeholder="Ex: NATAL20"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />

            <Input
              label="Texto de Desconto (ex: 20% OFF)"
              placeholder="Ex: 20% OFF ou R$ 50 OFF"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Link para Resgatar o Desconto"
              placeholder="https://loja.com.br/cupom..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e: any) => setTipo(e.target.value)}
                className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold"
              >
                <option value="cupom">Cupom de Desconto</option>
                <option value="promocao">Oferta / Promoção Direta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Descrição e Regras de Uso
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Válido para primeira compra em produtos selecionados..."
              className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data de Expiração (Opcional)"
              type="date"
              value={expiraEm}
              onChange={(e) => setExpiraEm(e.target.value)}
            />

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <span>Cupom Ativo no Site</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {editingCupom ? 'Salvar Alterações' : 'Cadastrar Cupom'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
