export type CategoriaType = 
  | 'Todos'
  | 'Tecnologia'
  | 'Casa'
  | 'Saúde'
  | 'Beleza'
  | 'Moda'
  | 'Livros'
  | 'Ferramentas'
  | string;

export type SeloType = '' | 'Oferta' | 'Mais vendido' | 'Promoção' | 'Novo';

export interface Anuncio {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: string;
  localizacao: string;
  link: string; // Affiliate link
  selo: SeloType | string;
  cupom?: string | null;
  imagens: string[]; // Storage paths in 'anuncios' bucket
  ativo: boolean;
  destaque: boolean;
  cliques: number;
  patrocinador_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined or calculated fields
  patrocinador?: Patrocinador | null;
}

export interface Patrocinador {
  id: string;
  nome: string;
  imagem: string; // Banner storage path or URL
  icone: string; // Logo storage path or URL
  link: string;
  ativo: boolean;
  ordem: number;
  cliques: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cupom {
  id: string;
  patrocinador_id?: string | null;
  titulo: string;
  descricao: string;
  codigo: string;
  desconto: string;
  link: string;
  tipo: 'cupom' | 'promocao' | string;
  expira_em?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  patrocinador?: Patrocinador | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
