export interface Refeicao {
  id?: string;
  nome: string;
  tipo: 'café da manhã' | 'almoço' | 'jantar' | 'lanche';
  calorias: number;
  proteinas: number;    // em gramas
  carboidratos: number; // em gramas
  gorduras: number;     // em gramas
  horario: string;      // formato: "HH:MM"
  observacoes?: string;
}

export interface PlanoAlimentar {
  id?: string;
  userId: string;       // ID do usuário no Firebase
  data: string;         // formato: "YYYY-MM-DD"
  refeicoes: Refeicao[];
  totalCalorias: number;
  totalProteinas: number;
  totalCarboidratos: number;
  totalGorduras: number;
  metaCalorias?: number; // meta diária do usuário
  criadoEm?: any;        // timestamp do Firebase
}