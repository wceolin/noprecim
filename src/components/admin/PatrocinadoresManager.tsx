import React, { useState } from 'react';
import { Patrocinador } from '../../types';
import { createPatrocinador, updatePatrocinador, deletePatrocinador, uploadAnuncioImage } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { SignedImage } from '../ui/SignedImage';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  Upload,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
  GripVertical,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

interface PatrocinadoresManagerProps {
  patrocinadores: Patrocinador[];
  onRefresh: () => void;
}

export const PatrocinadoresManager: React.FC<PatrocinadoresManagerProps> = ({
  patrocinadores,
  onRefresh
}) => {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Patrocinador | null>(null);
  const [loading, setLoading] = useState(false);

  // Deleting confirmation state
  const [deletingSponsor, setDeletingSponsor] = useState<Patrocinador | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState('');
  const [icone, setIcone] = useState('');
  const [link, setLink] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [ativo, setAtivo] = useState(true);

  // Upload status
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Drag reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedPatrocinadores = [...patrocinadores].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const openModal = (sponsor?: Patrocinador) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setNome(sponsor.nome);
      setImagem(sponsor.imagem || '');
      setIcone(sponsor.icone || '');
      setLink(sponsor.link || '');
      setOrdem(sponsor.ordem || 1);
      setAtivo(sponsor.ativo !== false);
    } else {
      setEditingSponsor(null);
      setNome('');
      setImagem('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80');
      setIcone('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80');
      setLink('https://');
      setOrdem(patrocinadores.length + 1);
      setAtivo(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSponsor(null);
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingBanner(true);
      try {
        const path = await uploadAnuncioImage(file);
        setImagem(path);
        showToast('Banner enviado com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao subir banner', 'error');
      } finally {
        setUploadingBanner(false);
      }
    }
  };

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingIcon(true);
      try {
        const path = await uploadAnuncioImage(file);
        setIcone(path);
        showToast('Ícone enviado com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao subir ícone', 'error');
      } finally {
        setUploadingIcon(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nome: nome.trim(),
      imagem: imagem.trim(),
      icone: icone.trim(),
      link: link.trim(),
      ordem,
      ativo
    };

    try {
      if (editingSponsor) {
        await updatePatrocinador(editingSponsor.id, payload);
        showToast('Patrocinador atualizado!', 'success');
      } else {
        await createPatrocinador(payload);
        showToast('Patrocinador cadastrado!', 'success');
      }
      onRefresh();
      closeModal();
    } catch (e: any) {
      showToast(e?.message || 'Erro ao salvar patrocinador', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSponsor) return;
    try {
      await deletePatrocinador(deletingSponsor.id);
      showToast('Patrocinador removido!', 'success');
      onRefresh();
      setDeletingSponsor(null);
    } catch (err) {
      showToast('Erro ao excluir patrocinador', 'error');
    }
  };

  // Reordering functions
  const handleSwapOrder = async (indexA: number, indexB: number) => {
    if (indexA < 0 || indexA >= sortedPatrocinadores.length) return;
    if (indexB < 0 || indexB >= sortedPatrocinadores.length) return;

    const itemA = sortedPatrocinadores[indexA];
    const itemB = sortedPatrocinadores[indexB];

    const orderA = itemA.ordem || indexA + 1;
    const orderB = itemB.ordem || indexB + 1;

    try {
      await Promise.all([
        updatePatrocinador(itemA.id, { ordem: orderB }),
        updatePatrocinador(itemB.id, { ordem: orderA })
      ]);
      showToast('Ordem do carrossel atualizada!', 'info');
      onRefresh();
    } catch (e) {
      showToast('Erro ao reordenar patrocinadores', 'error');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updated = [...sortedPatrocinadores];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    // Reassign sequential order 1, 2, 3...
    try {
      await Promise.all(
        updated.map((item, idx) => updatePatrocinador(item.id, { ordem: idx + 1 }))
      );
      showToast('Patrocinadores reordenados!', 'success');
      onRefresh();
    } catch (e) {
      showToast('Erro ao salvar nova sequência', 'error');
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span>Gerenciar Patrocinadores ({patrocinadores.length})</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre parceiros, altere a ordem do carrossel do topo e acompanhe as métricas de cliques.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => openModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Patrocinador
        </Button>
      </div>

      {/* Grid of Sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedPatrocinadores.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 text-zinc-400">
            Nenhum patrocinador cadastrado.
          </div>
        ) : (
          sortedPatrocinadores.map((sponsor, index) => (
            <div
              key={sponsor.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-4 rounded-[22px] bg-white dark:bg-zinc-900 border transition-all shadow-sm flex flex-col justify-between group cursor-grab active:cursor-grabbing ${
                draggedIndex === index
                  ? 'border-orange-500 opacity-50 scale-95'
                  : 'border-orange-100 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Banner & Logo overlay */}
                <div className="h-28 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3 relative border border-orange-100 dark:border-zinc-800">
                  <SignedImage path={sponsor.imagem} alt="" className="w-full h-full object-cover" />
                  
                  {/* Icon badge overlay */}
                  <div className="absolute bottom-2 left-2 w-11 h-11 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md bg-white">
                    <SignedImage path={sponsor.icone} alt="" className="w-full h-full object-cover" />
                  </div>

                  {/* Order Badge */}
                  <span className="absolute top-2 right-2 bg-zinc-950/70 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                    #{sponsor.ordem}
                  </span>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 left-2 p-1 rounded-lg bg-zinc-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                    {sponsor.nome}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      sponsor.ativo !== false
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                    }`}
                  >
                    {sponsor.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline truncate mt-1 flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{sponsor.link}</span>
                </a>

                <div className="mt-3 p-2.5 rounded-xl bg-orange-50/60 dark:bg-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <MousePointerClick className="w-3.5 h-3.5 text-orange-600" />
                    Cliques recebidos:
                  </span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {sponsor.cliques || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons & Order Swap */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSwapOrder(index, index - 1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none"
                    title="Mover para esquerda/cima no carrossel"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSwapOrder(index, index + 1)}
                    disabled={index === sortedPatrocinadores.length - 1}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none"
                    title="Mover para direita/baixo no carrossel"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(sponsor)}
                    className="p-1.5 rounded-xl text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSponsor(sponsor)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deletingSponsor && (
        <Modal
          isOpen={Boolean(deletingSponsor)}
          onClose={() => setDeletingSponsor(null)}
          title="Excluir Patrocinador"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Excluir "{deletingSponsor.nome}"?</h4>
                <p className="text-[11px] mt-0.5">
                  Esta ação removerá o banner e as associações aos cupons.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDeletingSponsor(null)}>
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
        title={editingSponsor ? 'Editar Patrocinador' : 'Novo Patrocinador'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <Input
            label="Nome da Loja / Parceiro"
            placeholder="Ex: Mercado Livre Oficial"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <Input
            label="Link de Afiliado / Destino"
            placeholder="https://mercadolivre.com.br/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />

          {/* Banner Upload */}
          <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              1. Banner Maior de Capa (Carrossel)
            </label>
            <Input
              placeholder="Cole uma URL ou envie um arquivo de imagem..."
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              required
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingBanner ? 'Enviando...' : 'Fazer Upload do Banner'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadBanner}
                className="hidden"
                disabled={uploadingBanner}
              />
            </label>
          </div>

          {/* Icon Upload */}
          <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              2. Logo / Ícone Pequeno (Quadrado)
            </label>
            <Input
              placeholder="Cole uma URL ou envie um arquivo de imagem..."
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              required
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingIcon ? 'Enviando...' : 'Fazer Upload da Logo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadIcon}
                className="hidden"
                disabled={uploadingIcon}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ordem no Carrossel"
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(parseInt(e.target.value) || 1)}
            />

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <span>Exibir no Carrossel do Site</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {editingSponsor ? 'Salvar Alterações' : 'Cadastrar Patrocinador'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
