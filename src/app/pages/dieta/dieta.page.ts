import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash, create, calendar, fastFood, arrowBack } from 'ionicons/icons';
import { DIETAS_PDF } from './dietas-pdf';

// INTERFACES LOCAIS - ATUALIZADAS
export interface Refeicao {
  id?: string;
  nome: string;
  tipo: string; // MUDADO: era union type específico, agora string genérico
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  horario: string;
  observacoes?: string;
}

export interface PlanoAlimentar {
  id?: string;
  userId: string;
  data: string;
  refeicoes: Refeicao[];
  totalCalorias: number;
  totalProteinas: number;
  totalCarboidratos: number;
  totalGorduras: number;
  metaCalorias?: number;
  criadoEm?: any;
}

@Component({
  selector: 'app-dieta',
  templateUrl: './dieta.page.html',
  styleUrls: ['./dieta.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DietaPage implements OnInit {
  
  planos: PlanoAlimentar[] = [];
  planoHoje: PlanoAlimentar | null = null;
  dataSelecionada: string = new Date().toISOString().split('T')[0];
  
  // VARIÁVEIS PARA DIETAS DO PDF
  biotipoSelecionado: string = 'ECTOMORFO';
  diaSelecionado: string = 'SEGUNDA';
  
  novaRefeicao: Refeicao = {
    nome: '',
    tipo: 'café da manhã',
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    horario: '08:00',
    observacoes: ''
  };

  mostrarFormRefeicao: boolean = false;
  carregando: boolean = false;

  constructor() {
    addIcons({ add, trash, create, calendar, fastFood, arrowBack });
  }

  // BOTÃO VOLTAR
  voltar() {
    window.history.back();
  }

  ngOnInit() {
    console.log('✅ DIETAS_PDF carregada com sucesso!', DIETAS_PDF);
    this.carregarPlanoDoDia();
  }

  async carregarPlanoDoDia() {
    this.carregando = true;
    this.carregarDietaPDF();
  }

  // CARREGAR DIETA DO PDF - CORRIGIDO
  carregarDietaPDF() {
    this.carregando = true;
    
    setTimeout(() => {
      const dieta = DIETAS_PDF[this.biotipoSelecionado as keyof typeof DIETAS_PDF];
      const refeicoesDoDia = dieta.dias[this.diaSelecionado as keyof typeof dieta.dias] || [];
      
      // CORREÇÃO: Converter para o tipo Refeicao
      const refeicoesConvertidas: Refeicao[] = refeicoesDoDia.map(ref => ({
        nome: ref.nome,
        tipo: ref.tipo,
        horario: ref.horario,
        calorias: ref.calorias,
        proteinas: ref.proteinas,
        carboidratos: ref.carboidratos,
        gorduras: ref.gorduras,
        observacoes: ref.observacoes
      }));
      
      this.planoHoje = {
        userId: 'usuario-teste',
        data: this.dataSelecionada,
        refeicoes: refeicoesConvertidas,
        totalCalorias: refeicoesConvertidas.reduce((total, ref) => total + ref.calorias, 0),
        totalProteinas: refeicoesConvertidas.reduce((total, ref) => total + ref.proteinas, 0),
        totalCarboidratos: refeicoesConvertidas.reduce((total, ref) => total + ref.carboidratos, 0),
        totalGorduras: refeicoesConvertidas.reduce((total, ref) => total + ref.gorduras, 0),
        metaCalorias: dieta.metaCalorias
      };
      
      this.carregando = false;
    }, 500);
  }

  // SELECIONAR BIOTIPO
  selecionarBiotipo(biotipo: string) {
    this.biotipoSelecionado = biotipo;
    this.carregarDietaPDF();
  }

  // SELECIONAR DIA
  selecionarDia(dia: string) {
    this.diaSelecionado = dia;
    this.carregarDietaPDF();
  }

  // MÉTODO PARA FORMATAR NOME DO DIA
  getDiaDisplay(dia: string): string {
    const diasMap: { [key: string]: string } = {
      'SEGUNDA': 'Segunda',
      'TERCA': 'Terça', 
      'QUARTA': 'Quarta',
      'QUINTA': 'Quinta',
      'SEXTA': 'Sexta',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return diasMap[dia] || dia;
  }

  // MÉTODOS PARA REFEIÇÕES MANUAIS
  adicionarRefeicao() {
    if (!this.planoHoje) return;

    this.planoHoje.refeicoes.push({...this.novaRefeicao});
    this.atualizarTotais();
    
    this.limparFormRefeicao();
    this.mostrarFormRefeicao = false;
  }

  atualizarTotais() {
    if (!this.planoHoje) return;

    this.planoHoje.totalCalorias = this.planoHoje.refeicoes.reduce((total, refeicao) => total + refeicao.calorias, 0);
    this.planoHoje.totalProteinas = this.planoHoje.refeicoes.reduce((total, refeicao) => total + refeicao.proteinas, 0);
    this.planoHoje.totalCarboidratos = this.planoHoje.refeicoes.reduce((total, refeicao) => total + refeicao.carboidratos, 0);
    this.planoHoje.totalGorduras = this.planoHoje.refeicoes.reduce((total, refeicao) => total + refeicao.gorduras, 0);
  }

  removerRefeicao(index: number) {
    if (!this.planoHoje) return;
    this.planoHoje.refeicoes.splice(index, 1);
    this.atualizarTotais();
  }

  limparFormRefeicao() {
    this.novaRefeicao = {
      nome: '',
      tipo: 'café da manhã',
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      horario: '08:00',
      observacoes: ''
    };
  }

  onDataChange() {
    this.carregarPlanoDoDia();
  }

  calcularPorcentagemMeta(): number {
    if (!this.planoHoje || !this.planoHoje.metaCalorias) return 0;
    return (this.planoHoje.totalCalorias / this.planoHoje.metaCalorias) * 100;
  }

  // OBTER DIETA ATUAL
  get dietaAtual() {
    return DIETAS_PDF[this.biotipoSelecionado as keyof typeof DIETAS_PDF];
  }
}