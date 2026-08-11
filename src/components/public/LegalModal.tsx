import React from 'react';
import { Modal } from '../ui/Modal';
import { ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <Modal
      isOpen={Boolean(type)}
      onClose={onClose}
      title={isPrivacy ? 'Política de Privacidade' : 'Termos de Uso'}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-h-96 overflow-y-auto pr-2">
        {isPrivacy ? (
          <>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-zinc-800 text-orange-900 dark:text-orange-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Sua privacidade é prioridade no NOPRECIM</span>
            </div>

            <p>
              O site <strong>NOPRECIM</strong> é um portal de divulgação independente de ofertas, promoções, cupons de desconto e links de afiliados de lojas parceiras.
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">1. Coleta de Dados</h4>
            <p>
              Não solicitamos dados pessoais para navegar no portal. Ao clicar em nossos links de afiliados, você é redirecionado para a plataforma oficial do lojista (como Amazon, Mercado Livre, Shopee, etc.), onde as compras são processadas com total segurança do lojista.
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">2. Cookies e Métricas</h4>
            <p>
              Utilizamos armazenamento local básico para lembrar de preferências do usuário (como tema claro/escuro) e contadores de métricas de cliques para manter o catálogo de ofertas relevante.
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">3. Contato</h4>
            <p>
              Para dúvidas ou solicitações referente ao conteúdo divulgado, entre em contato através dos nossos canais oficiais de atendimento.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-zinc-800 text-orange-900 dark:text-orange-300 font-bold">
              <FileText className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Regras de Utilização do Portal</span>
            </div>

            <p>
              Bem-vindo ao <strong>NOPRECIM</strong>. Ao acessar este site, você concorda com os seguintes termos:
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">1. Isenção de Responsabilidade</h4>
            <p>
              Os preços, cupons e disponibilidades de estoque são definidos pelas lojas parceiras e podem sofrer alterações a qualquer momento sem aviso prévio. Recomendamos sempre verificar o valor final no carrinho de compras da loja parceira.
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">2. Comissões de Afiliados</h4>
            <p>
              Alguns links publicados neste portal são links de afiliados. Isso significa que podemos receber uma pequena comissão caso você efetue uma compra através dos nossos links, sem qualquer custo adicional para você.
            </p>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm pt-2">3. Direitos Autorais</h4>
            <p>
              As marcas, logotipos e nomes de produtos mencionados pertencem aos seus respectivos detentores e são utilizados unicamente para fins de identificação e divulgação dos produtos.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
};
