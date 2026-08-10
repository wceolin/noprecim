import React, { useState, useEffect } from 'react';
import {
  getSocialConfig,
  saveSocialConfig,
  fetchSocialConfigFromDb,
  SocialConfig,
  buildWhatsAppLink
} from '../../lib/socialConfig';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { MessageCircle, Send, Instagram, Save, Video, ExternalLink } from 'lucide-react';

export const SocialConfigManager: React.FC = () => {
  const [config, setConfig] = useState<SocialConfig>(getSocialConfig());
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSocialConfigFromDb().then((dbConfig) => {
      setConfig(dbConfig);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSocialConfig(config);
      showToast('Redes sociais salvas no banco de dados com sucesso!', 'success');
    } catch (e) {
      showToast('Erro ao salvar redes sociais', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentWhatsappLink = buildWhatsAppLink(config);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Configuração de Redes Sociais & Canais
        </h2>
        <p className="text-xs text-zinc-500">
          Ajuste os links de atendimento e divulgação (WhatsApp, Instagram, Telegram e TikTok) do portal.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-[22px] border border-orange-100 dark:border-zinc-800 p-6 space-y-5 shadow-sm">
        
        {/* WhatsApp Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>WhatsApp (Botão Flutuante e Contato)</span>
          </div>

          <Input
            label="Número do WhatsApp (com DDD e DDI 55)"
            placeholder="Ex: 5511999999999"
            value={config.whatsappNumero}
            onChange={(e) => setConfig({ ...config, whatsappNumero: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Mensagem Pré-definida ao Iniciar Conversa
            </label>
            <textarea
              rows={2}
              value={config.whatsappMensagem}
              onChange={(e) => setConfig({ ...config, whatsappMensagem: e.target.value })}
              className="w-full rounded-2xl border border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs"
            />
          </div>

          <div className="pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Link Gerado para Teste:
            </span>
            <a
              href={currentWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-600 dark:text-emerald-400 underline break-all flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span>{currentWhatsappLink}</span>
            </a>
          </div>
        </div>

        {/* Telegram Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-sm">
            <Send className="w-5 h-5 text-sky-600 shrink-0" />
            <span>Canal do Telegram</span>
          </div>

          <Input
            label="Link do Canal / Grupo no Telegram"
            placeholder="https://t.me/ofertasdahora"
            value={config.telegramLink}
            onChange={(e) => setConfig({ ...config, telegramLink: e.target.value })}
          />
        </div>

        {/* Instagram Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <Instagram className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Perfil do Instagram</span>
          </div>

          <Input
            label="Link ou Handle do Instagram"
            placeholder="https://instagram.com/ofertasdahoraoficial ou @ofertasdahoraoficial"
            value={config.instagramHandle}
            onChange={(e) => setConfig({ ...config, instagramHandle: e.target.value })}
          />
        </div>

        {/* TikTok Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <Video className="w-5 h-5 text-zinc-800 dark:text-zinc-200 shrink-0" />
            <span>Perfil do TikTok</span>
          </div>

          <Input
            label="Link do Perfil do TikTok"
            placeholder="https://tiktok.com/@ofertasdahora"
            value={config.tiktokLink}
            onChange={(e) => setConfig({ ...config, tiktokLink: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" isLoading={saving} icon={<Save className="w-4 h-4" />}>
            Salvar Redes Sociais
          </Button>
        </div>
      </form>
    </div>
  );
};
