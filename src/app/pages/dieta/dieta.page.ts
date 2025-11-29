import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash, create, calendar, fastFood, arrowBack } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

// INTERFACES LOCAIS (temporário)
export interface Refeicao {
  id?: string;
  nome: string;
  tipo: 'café da manhã' | 'almoço' | 'jantar' | 'lanche';
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
    this.carregarPlanoDoDia();
  }

  async carregarPlanoDoDia() {
    this.carregando = true;
    
    // DADOS MOCK (temporário)
    setTimeout(() => {
      this.planoHoje = {
        userId: 'usuario-teste',
        data: this.dataSelecionada,
        refeicoes: [
          {
            nome: 'Omelete de claras',
            tipo: 'café da manhã',
            calorias: 180,
            proteinas: 15,
            carboidratos: 2,
            gorduras: 12,
            horario: '08:00',
            observacoes: 'Com queijo branco'
          }
        ],
        totalCalorias: 180,
        totalProteinas: 15,
        totalCarboidratos: 2,
        totalGorduras: 12,
        metaCalorias: 2000
      };
      this.carregando = false;
    }, 1000);
  }

  adicionarRefeicao() {
    if (!this.planoHoje) return;

    this.planoHoje.refeicoes.push({...this.novaRefeicao});
    this.atualizarTotais();
    
    this.limparFormRefeicao();
    this.mostrarFormRefeicao = false;
    
    console.log('Refeição adicionada:', this.novaRefeicao);
  }

  atualizarTotais() {
    if (!this.planoHoje) return;

    this.planoHoje.totalCalorias = this.planoHoje.refeicoes.reduce((total: number, refeicao: Refeicao) => total + refeicao.calorias, 0);
    this.planoHoje.totalProteinas = this.planoHoje.refeicoes.reduce((total: number, refeicao: Refeicao) => total + refeicao.proteinas, 0);
    this.planoHoje.totalCarboidratos = this.planoHoje.refeicoes.reduce((total: number, refeicao: Refeicao) => total + refeicao.carboidratos, 0);
    this.planoHoje.totalGorduras = this.planoHoje.refeicoes.reduce((total: number, refeicao: Refeicao) => total + refeicao.gorduras, 0);
  }

  removerRefeicao(index: number) {
    if (!this.planoHoje) return;

    this.planoHoje.refeicoes.splice(index, 1);
    this.atualizarTotais();
    console.log('Refeição removida:', index);
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
}