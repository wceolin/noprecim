import React, { useState } from 'react';
import { Anuncio, Patrocinador } from '../../types';
import { createAnuncio, updateAnuncio, deleteAnuncio, uploadAnuncioImage } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { SignedImage } from '../ui/SignedImage';
import { useToast } from '../../context/ToastContext';
import { DealDetailModal } from '../public/DealDetailModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Copy,
  CopyCheck,
  Share2,
  Eye,
  Flame,
  X,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface AnunciosManagerProps {
  anuncios: Anuncio[];
  patrocinadores: Patrocinador[];
  onRefresh: () => void;
}

const CATEGORIES = ['Tecnologia', 'Casa', 'Saúde', 'Beleza', 'Moda', 'Livros', 'Ferramentas', 'Automotiva'];
const SELOS = ['', 'Oferta', 'Mais vendido', 'Promoção', 'Novo'];

export const AnunciosManager: React.FC<AnunciosManagerProps> = ({
  anuncios,
  patrocinadores,
  onRefresh
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Ativo' | 'Inativo' | 'Destaque'>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Delete Alert Dialog State
  const [deletingAnuncio, setDeletingAnuncio] = useState<Anuncio | null>(null);

  // Preview Modal State
  const [previewAnuncio, setPreviewAnuncio] = useState<Anuncio | null>(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Tecnologia');
  const [preco, setPreco] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [link, setLink] = useState('');
  const [selo, setSelo] = useState('');
  const [cupom, setCupom] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [destaque, setDestaque] = useState(false);
  const [patrocinadorId, setPatrocinadorId] = useState<string>('');

  const openModal = (anuncio?: Anuncio) => {
    if (anuncio) {
      setEditingAnuncio(anuncio);
      setTitulo(anuncio.titulo);
      setDescricao(anuncio.descricao);
      setCategoria(anuncio.categoria || 'Tecnologia');
      setPreco(anuncio.preco || '');
      setLocalizacao(anuncio.localizacao || '');
      setLink(anuncio.link || '');
      setSelo(anuncio.selo || '');
      setCupom(anuncio.cupom || '');
      setImagens(anuncio.imagens || []);
      setAtivo(anuncio.ativo !== false);
      setDestaque(Boolean(anuncio.destaque));
      setPatrocinadorId(anuncio.patrocinador_id || '');
    } else {
      setEditingAnuncio(null);
      setTitulo('');
      setDescricao('');
      setCategoria('Tecnologia');
      setPreco('');
      setLocalizacao('Envio para todo Brasil');
      setLink('https://');
      setSelo('Oferta');
      setCupom('');
      setImagens([]);
      setAtivo(true);
      setDestaque(false);
      setPatrocinadorId('');
    }
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAnuncio(null);
  };

  // Multiple files upload (drag or file select)
  const processFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    const uploadedPaths: string[] = [];
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const path = await uploadAnuncioImage(file);
        if (path) {
          uploadedPaths.push(path);
        }
      } catch (err) {
        console.error('Upload error for file:', file.name, err);
        hasError = true;
      }
    }

    if (uploadedPaths.length > 0) {
      setImagens((prev) => [...prev, ...uploadedPaths]);
      showToast(`${uploadedPaths.length} imagem(ns) enviada(s)!`, 'success');
    }

    if (hasError) {
      showToast('Ocorreu um problema ao subir algumas imagens. Tente novamente.', 'error');
    }

    setUploadingImage(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFilesUpload(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesUpload(e.dataTransfer.files);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImagens((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      showToast('URL da imagem adicionada!', 'info');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagens.length) return;
    const updated = [...imagens];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImagens(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      preco: preco.trim(),
      localizacao: localizacao.trim(),
      link: link.trim(),
      selo,
      cupom: cupom.trim() ? cupom.trim() : null,
      imagens: imagens.length > 0 ? imagens : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      ativo,
      destaque,
      patrocinador_id: patrocinadorId || null
    };

    try {
      if (editingAnuncio) {
        await updateAnuncio(editingAnuncio.id, payload);
        showToast('Anúncio atualizado com sucesso!', 'success');
      } else {
        await createAnuncio(payload);
        showToast('Anúncio criado com sucesso!', 'success');
      }
      onRefresh();
      closeModal();
    } catch (err: any) {
      console.error('Error saving anuncio:', err);
      showToast(err?.message || 'Erro de permissão ou rede ao salvar o anúncio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Duplicate deal
  const handleDuplicate = async (anuncio: Anuncio) => {
    try {
      const { id, cliques, created_at, updated_at, patrocinador, ...rest } = anuncio;
      const duplicatedPayload = {
        ...rest,
        titulo: `${anuncio.titulo} (Cópia)`,
        ativo: false
      };
      await createAnuncio(duplicatedPayload);
      showToast('Anúncio duplicado com sucesso! (Criado como inativo)', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Erro ao duplicar anúncio', 'error');
    }
  };

  // Delete deal with confirm dialog
  const handleConfirmDelete = async () => {
    if (!deletingAnuncio) return;
    try {
      await deleteAnuncio(deletingAnuncio.id);
      showToast('Anúncio excluído!', 'success');
      onRefresh();
      setDeletingAnuncio(null);
    } catch (err) {
      showToast('Erro de permissão ao excluir o anúncio.', 'error');
    }
  };

  // Generate promotional text for WhatsApp/Telegram
  const handleGenerateText = (anuncio: Anuncio) => {
    const lines = [`🔥 ${anuncio.titulo}`];
    
    if (anuncio.preco && anuncio.preco.trim()) {
      lines.push(`💰 R$ ${anuncio.preco.replace(/^R\$\s*/i, '')} 😱😱`);
    }
    
    if (anuncio.cupom && anuncio.cupom.trim()) {
      lines.push(`🏷️ Cupom: ${anuncio.cupom}`);
    }

    if (anuncio.link) {
      lines.push(`🔗 ${anuncio.link}`);
    }

    const textReady = lines.join('\n\n');

    navigator.clipboard.writeText(textReady);
    showToast('Texto de divulgação copiado para a área de transferência!', 'success');
  };

  // Filter logic
  const filteredAnuncios = anuncios.filter((a) => {
    const matchesSearch =
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.categoria && a.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'Todos' || a.categoria === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'Ativo') matchesStatus = a.ativo === true;
    if (selectedStatus === 'Inativo') matchesStatus = a.ativo === false;
    if (selectedStatus === 'Destaque') matchesStatus = Boolean(a.destaque);

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & New Deal Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Gerenciar Anúncios e Ofertas</span>
            <span className="text-xs bg-orange-100 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 px-2.5 py-0.5 rounded-full font-bold">
              {anuncios.length} total
            </span>
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre, edite e acompanhe os cliques de links de afiliados.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => openModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Anúncio
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar título ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-2xl border border-orange-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Category Select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-2xl border border-orange-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
        >
          <option value="Todos">Todas as Categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status Filter Select */}
        <select
          value={selectedStatus}
          onChange={(e: any) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-2xl border border-orange-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
        >
          <option value="Todos">Todos os Status</option>
          <option value="Ativo">Apenas Ativos</option>
          <option value="Inativo">Apenas Inativos</option>
          <option value="Destaque">Apenas Destaques</option>
        </select>
      </div>

      {/* Table of Deals */}
      <div className="bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/60 dark:bg-zinc-800/60 border-b border-orange-100 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Selo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Cliques</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredAnuncios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    Nenhum anúncio encontrado.
                  </td>
                </tr>
              ) : (
                filteredAnuncios.map((anuncio) => (
                  <tr
                    key={anuncio.id}
                    className="hover:bg-orange-50/40 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border">
                          <SignedImage path={anuncio.imagens?.[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                            {anuncio.titulo}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-xs">
                            {anuncio.link}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {anuncio.categoria}
                    </td>

                    <td className="p-4 font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      {anuncio.preco}
                    </td>

                    <td className="p-4">
                      {anuncio.selo ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-zinc-800 dark:text-orange-300">
                          {anuncio.selo}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            anuncio.ativo ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {anuncio.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        {anuncio.destaque && (
                          <span className="ml-1 text-[10px] font-black text-amber-950 bg-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-current" /> Destaque
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {anuncio.cliques || 0}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Gerar Texto de Divulgação */}
                        <button
                          onClick={() => handleGenerateText(anuncio)}
                          className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Copiar texto pronto para WhatsApp/Telegram"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Duplicar */}
                        <button
                          onClick={() => handleDuplicate(anuncio)}
                          className="p-1.5 rounded-xl text-sky-600 hover:bg-sky-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Duplicar anúncio"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Visualizar no Site */}
                        <button
                          onClick={() => setPreviewAnuncio(anuncio)}
                          className="p-1.5 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Visualizar como no site"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => openModal(anuncio)}
                          className="p-1.5 rounded-xl text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Excluir com Dialog */}
                        <button
                          onClick={() => setDeletingAnuncio(anuncio)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      {deletingAnuncio && (
        <Modal
          isOpen={Boolean(deletingAnuncio)}
          onClose={() => setDeletingAnuncio(null)}
          title="Confirmar Exclusão"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Excluir permanentemente?</h4>
                <p className="text-[11px] mt-0.5">
                  Tem certeza que deseja excluir "{deletingAnuncio.titulo}"? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDeletingAnuncio(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      <DealDetailModal
        anuncio={previewAnuncio}
        onClose={() => setPreviewAnuncio(null)}
      />

      {/* Modal Form for Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAnuncio ? 'Editar Anúncio' : 'Cadastrar Novo Anúncio'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título do Anúncio / Produto"
            placeholder="Ex: Fone Bluetooth Noise Cancelling TWS"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Preço"
              placeholder="Ex: R$ 199,90"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Link de Afiliado (URL de Destino)"
              placeholder="https://amazon.com.br/dp/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Selo Promocional
              </label>
              <select
                value={selo}
                onChange={(e) => setSelo(e.target.value)}
                className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold"
              >
                {SELOS.map((s) => (
                  <option key={s} value={s}>
                    {s || '(Sem selo)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Código de Cupom (Opcional)"
              placeholder="Ex: OFERTA10"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
            />

            <Input
              label="Localização / Informações de Envio"
              placeholder="Ex: Frete Grátis Prime"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Patrocinador / Loja Parceira (Opcional)
            </label>
            <select
              value={patrocinadorId}
              onChange={(e) => setPatrocinadorId(e.target.value)}
              className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold"
            >
              <option value="">Nenhum (Anúncio Independente)</option>
              {patrocinadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Descrição do Anúncio
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as vantagens, especificações e diferenciais desta oferta..."
              className="w-full rounded-2xl border border-orange-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs"
              required
            />
          </div>

          {/* Multi-Images Upload with Drag & Drop and Reorder */}
          <div className="space-y-3 p-4 rounded-2xl bg-orange-50/50 dark:bg-zinc-800/50 border border-orange-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Imagens do Produto (Bucket Privado 'anuncios')
              </label>
              <span className="text-[10px] text-zinc-400 font-semibold">
                * A 1ª imagem será usada como Capa
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 border-2 border-dashed rounded-2xl text-center transition-colors ${
                dragActive
                  ? 'border-orange-500 bg-orange-100/60 dark:bg-zinc-800'
                  : 'border-orange-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60'
              }`}
            >
              <Upload className="w-6 h-6 mx-auto text-orange-500 mb-1" />
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Arraste imagens aqui ou selecione arquivos
              </p>
              <label className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 text-white text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <span>{uploadingImage ? 'Enviando...' : 'Selecionar Arquivos'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* URL Fallback */}
            <div className="flex gap-2">
              <Input
                placeholder="Ou cole uma URL de imagem externa..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddImageUrl}>
                Adicionar URL
              </Button>
            </div>

            {/* Reorderable Image Previews */}
            {imagens.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {imagens.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 group shadow-sm"
                  >
                    <SignedImage path={img} alt="" className="w-full h-full object-cover" />

                    {/* Capa Badge for first image */}
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-zinc-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-md shadow-md">
                        Capa
                      </span>
                    )}

                    {/* Action Controls Overlay */}
                    <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index - 1)}
                          className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40"
                          title="Mover para esquerda"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {index < imagens.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, index + 1)}
                          className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40"
                          title="Mover para direita"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        title="Remover imagem"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Anúncio Ativo no Site</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Colocar em Destaque</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {editingAnuncio ? 'Salvar Alterações' : 'Criar Anúncio'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
