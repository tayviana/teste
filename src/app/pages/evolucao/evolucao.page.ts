import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; // Importante para navegação
import { 
  IonContent, IonCard, IonCardContent, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonList, IonListHeader, AlertController, ToastController, IonBadge 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, trendingDown, time, barbell, grid, statsChart, person, scale } from 'ionicons/icons';

import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, collection, addDoc, query, orderBy, getDocs, limit } from '@angular/fire/firestore';

@Component({
  selector: 'app-evolucao',
  templateUrl: './evolucao.page.html',
  styleUrls: ['./evolucao.page.scss'],
  standalone: true,
  // Limpo: Removidos imports não usados no HTML (IonHeader, etc) para evitar avisos
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    IonContent, 
    IonCard, IonCardContent, 
    IonItem, IonLabel, IonInput, IonButton, IonIcon, 
    IonList, IonListHeader, IonBadge
  ]
})
export class EvolucaoPage implements OnInit {
  // Variáveis de Estado
  userData: any = {};
  novoPeso: number | null = null;
  historicoPesos: any[] = [];
  imcAtual = 0;
  progressoBarra = 0; // Para o visual da barra de progresso (0-100%)
  diferencaPeso = 0; // Mostra quanto perdeu/ganhou desde a última vez

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router // Injetado para navegar para a Home
  ) {
    // Registra os ícones usados no HTML
    addIcons({ trendingUp, trendingDown, time, barbell, grid, statsChart, person, scale });
  }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      await this.carregarDados(user.uid);
      await this.carregarHistorico(user.uid);
    }
  }

  // Busca dados principais do usuário (Nome, Peso Atual, Altura, Biotipo)
  async carregarDados(uid: string) {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (docSnap.exists()) {
        this.userData = docSnap.data();
        this.calcularIMC();
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }

  // Busca o histórico de pesos na sub-coleção 'historico_peso'
  async carregarHistorico(uid: string) {
    try {
      // Pega os últimos 5 registros ordenados por data
      const q = query(
        collection(this.firestore, 'usuarios', uid, 'historico_peso'),
        orderBy('data', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      this.historicoPesos = querySnapshot.docs.map(d => {
        const data = d.data();
        // Formata a data para exibir bonito (ex: 28/11/2025)
        return { 
          ...data, 
          dataFormatada: new Date(data['data'].seconds * 1000).toLocaleDateString('pt-BR') 
        };
      });

      // Calcula a diferença: (Peso Atual - Peso Anterior)
      if (this.historicoPesos.length > 1) {
        const atual = this.historicoPesos[0].peso;
        const anterior = this.historicoPesos[1].peso;
        this.diferencaPeso = atual - anterior;
      }
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    }
  }

  // Calcula onde a bolinha deve ficar na régua de IMC
  calcularIMC() {
    if (this.userData.peso && this.userData.altura) {
      this.imcAtual = this.userData.peso / (this.userData.altura * this.userData.altura);
      
      // Lógica visual: IMC 15 é o 0%, IMC 40 é o 100% da barra
      this.progressoBarra = ((this.imcAtual - 15) / (40 - 15)) * 100;
      
      // Trava a barra entre 0 e 100 para não estourar o layout
      if (this.progressoBarra > 100) this.progressoBarra = 100;
      if (this.progressoBarra < 0) this.progressoBarra = 0;
    }
  }

  // Função principal ao clicar em "Registrar Agora"
  async registrarNovoPeso() {
    if (!this.novoPeso) return;

    const user = this.auth.currentUser;
    if (!user) return;

    // 1. Verifica se o biotipo mudou com esse novo peso (A Lógica Inteligente)
    const novoIMC = this.novoPeso / (this.userData.altura * this.userData.altura);
    let novoBiotipo = '';

    if (novoIMC < 18.5) novoBiotipo = 'Ectomorfo';
    else if (novoIMC < 25) novoBiotipo = 'Mesomorfo';
    else novoBiotipo = 'Endomorfo';

    const biotipoAntigo = this.userData.biotipo;
    const mudouBiotipo = novoBiotipo !== biotipoAntigo; // True se mudou

    try {
      // 2. Adiciona registro no histórico (para gerar a lista)
      await addDoc(collection(this.firestore, 'usuarios', user.uid, 'historico_peso'), {
        peso: this.novoPeso,
        data: new Date(),
        biotipoNaEpoca: novoBiotipo
      });

      // 3. Atualiza o perfil oficial do usuário com o novo peso e biotipo
      await updateDoc(doc(this.firestore, 'usuarios', user.uid), {
        peso: this.novoPeso,
        biotipo: novoBiotipo
      });

      // Atualiza as variáveis locais para a tela mudar na hora
      this.userData.peso = this.novoPeso;
      this.userData.biotipo = novoBiotipo;
      this.calcularIMC();
      this.novoPeso = null; // Limpa o campo
      await this.carregarHistorico(user.uid); // Atualiza a lista lá embaixo

      // 4. Feedback ao usuário
      if (mudouBiotipo) {
        this.mostrarAlertaEvolucao(biotipoAntigo, novoBiotipo);
      } else {
        this.mostrarToast('Peso registrado! Continue focado.');
      }

    } catch (e) {
      console.error(e);
      this.mostrarToast('Erro ao salvar peso.');
    }
  }

  // Mostra o Alerta Gamificado se mudou de nível (SEM HTML QUEBRADO)
  async mostrarAlertaEvolucao(antigo: string, novo: string) {
    const alert = await this.alertCtrl.create({
      header: '🎉 NÍVEL ATUALIZADO!',
      subHeader: 'Seu corpo mudou, seu treino também!',
      // Usamos toUpperCase para destacar, sem usar tags <b> que o Ionic bloqueia
      message: `Você saiu de ${antigo ? antigo.toUpperCase() : 'ANTERIOR'} para ${novo.toUpperCase()}. O VIVAFIT atualizou seus treinos automaticamente para se adequar à sua nova fase.`,
      buttons: [
        {
          text: 'Ver Novos Treinos',
          handler: () => {
            // Redireciona para a Home ao clicar
            this.router.navigate(['/home']);
          }
        }
      ],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async mostrarToast(msg: string) {
    const t = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000, 
      color: 'success', 
      position: 'top' 
    });
    t.present();
  }
}