import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, grid, statsChart, person } from 'ionicons/icons';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon]
})
export class HomePage implements OnInit {
  userData: any = {};
  biotipo = 'Carregando...'; 
  
  // Variáveis do Calendário
  mesAtual: string = '';
  diasCalendario: any[] = [];

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    addIcons({ chevronForward, grid, statsChart, person });
  }

  ngOnInit() {
    this.gerarCalendario(); // Gera as datas do topo (só precisa uma vez)
  }

  // --- A MÁGICA ACONTECE AQUI ---
  // Esse método roda TODA VEZ que a tela aparece (mesmo voltando de outra)
  ionViewWillEnter() {
    const user = this.auth.currentUser;
    if (user) {
      this.carregarDados(user.uid);
    }
  }

  // --- LÓGICA DO CALENDÁRIO ---
  gerarCalendario() {
    const hoje = new Date();
    
    // Formata o mês (Ex: NOVEMBRO 2025)
    const opcoesMes: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    this.mesAtual = hoje.toLocaleDateString('pt-BR', opcoesMes).toUpperCase().replace(' DE ', ' '); 

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    
    // Cria 2 dias antes e 3 dias depois de hoje
    for (let i = -2; i <= 3; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);

      this.diasCalendario.push({
        dia: data.getDate(),
        semana: diasSemana[data.getDay()],
        isHoje: i === 0 // Marca se é o dia atual para pintar de verde
      });
    }
  }

  // --- CARREGAR DADOS DO FIREBASE ---
  async carregarDados(uid: string) {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'usuarios', uid));
      
      if (docSnap.exists()) {
        this.userData = docSnap.data();

        // 1. Tenta pegar o biotipo já salvo no Cadastro ou atualizado na Evolução
        if (this.userData.biotipo) {
          this.biotipo = this.userData.biotipo;
        } 
        // 2. Se for usuário antigo (sem biotipo salvo), calcula agora (Fallback)
        else if (this.userData.peso && this.userData.altura) {
          const imc = this.userData.peso / (this.userData.altura * this.userData.altura);
          if (imc < 18.5) this.biotipo = 'Ectomorfo';
          else if (imc < 25) this.biotipo = 'Mesomorfo';
          else this.biotipo = 'Endomorfo';
        } else {
          this.biotipo = 'Indefinido';
        }
        
        console.log('Dados atualizados na Home:', this.biotipo);
      }
    } catch (e) {
      console.error('Erro ao buscar usuário:', e);
    }
  }

  // --- NAVEGAÇÃO PARA O TREINO ---
  abrirTreino(tipo: string) {
    // Manda o Tipo (A, B, C) e o Biotipo para a página de detalhes saber qual lista carregar
    this.router.navigate(['/treino-detalhe', tipo, this.biotipo]);
  }
}