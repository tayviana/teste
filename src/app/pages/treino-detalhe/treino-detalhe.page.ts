import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // <--- Adicionei Router aqui
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButtons, IonBackButton, IonList, IonItem, 
  IonLabel, IonCheckbox, IonCard, IonCardContent, 
  IonIcon, IonBadge, IonButton, ToastController 
} from '@ionic/angular/standalone';
import { DomSanitizer } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { water, save, checkmarkDone } from 'ionicons/icons';

// Firebase
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-treino-detalhe',
  templateUrl: './treino-detalhe.page.html',
  styleUrls: ['./treino-detalhe.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonCheckbox, IonCard, IonCardContent, IonIcon, IonBadge, IonButton]
})
export class TreinoDetalhePage implements OnInit {
  tipoTreino = '';
  biotipo = '';
  treinoAtual: any = {};
  videoSafeUrl: any;
  
  exerciciosEstado: any[] = [];
  dataHoje = '';

  // --- MATRIZ DE TREINOS (Mantida igual) ---
  dbTreinos: any = {
    'Ectomorfo': {
      'A': {
        foco: 'Força Bruta e Carga',
        video: 'https://www.youtube.com/embed/geKGIAXdDfk', 
        exercicios: [
          { nome: 'Supino Reto com Barra', serie: '4x 6 a 8', dica: 'Carga máxima' },
          { nome: 'Desenvolvimento Militar', serie: '4x 8', dica: 'Cuidado com a lombar' },
          { nome: 'Tríceps Testa', serie: '3x 10', dica: 'Movimento controlado' },
          { nome: 'Elevação Lateral', serie: '3x 12', dica: 'Foco no ombro' }
        ]
      },
      'B': {
        foco: 'Construção de Pernas',
        video: 'https://www.youtube.com/embed/SW_C1A-rejs', 
        exercicios: [
          { nome: 'Agachamento Livre', serie: '4x 8', dica: 'Desça devagar' },
          { nome: 'Leg Press 45', serie: '4x 10', dica: 'Não trave o joelho' },
          { nome: 'Panturrilha Sentado', serie: '4x 15', dica: 'Amplitude máxima' }
        ]
      },
      'C': {
        foco: 'Costas Densas',
        video: 'https://www.youtube.com/embed/S_I5p835KjU', 
        exercicios: [
          { nome: 'Levantamento Terra', serie: '3x 6', dica: 'Rei dos exercícios' },
          { nome: 'Remada Curvada', serie: '3x 8', dica: 'Coluna reta' },
          { nome: 'Barra Fixa', serie: '3x Falha', dica: 'Use elástico se precisar' }
        ]
      }
    },
    'Endomorfo': {
      'A': {
        foco: 'Metabolismo Acelerado',
        video: 'https://www.youtube.com/embed/IODxDxX7oi4', 
        exercicios: [
          { nome: 'Flexão de Braço + Burpee', serie: '4x 15', dica: 'Sem descanso' },
          { nome: 'Supino com Halteres', serie: '3x 15', dica: 'Cadência rápida' },
          { nome: 'Tríceps Corda', serie: '3x 20', dica: 'Queimação total' },
          { nome: 'Polichinelo', serie: '1 min', dica: 'Entre as séries' }
        ]
      },
      'B': {
        foco: 'Gasto Calórico Inferior',
        video: 'https://www.youtube.com/embed/U332iCjX5Hk', 
        exercicios: [
          { nome: 'Agachamento com Salto', serie: '4x 15', dica: 'Explosão' },
          { nome: 'Passada (Afundo)', serie: '3x 20', dica: 'Cada perna' },
          { nome: 'Cadeira Extensora (Drop-set)', serie: '3x Falha', dica: 'Diminua o peso e continue' }
        ]
      },
      'C': {
        foco: 'Cardio Intenso',
        video: 'https://www.youtube.com/embed/ml6cT4AZdqI', 
        exercicios: [
          { nome: 'Esteira (HIIT)', serie: '20 min', dica: '1min correndo / 1min andando' },
          { nome: 'Puxada Frente', serie: '3x 15', dica: 'Controle o retorno' },
          { nome: 'Abdominal Supra', serie: '4x 20', dica: 'Solte o ar subindo' }
        ]
      }
    },
    'Mesomorfo': {
      'A': {
        foco: 'Hipertrofia e Definição',
        video: 'https://www.youtube.com/embed/aclHkVaku9U',
        exercicios: [
          { nome: 'Supino Inclinado', serie: '4x 12', dica: 'Foco no peitoral superior' },
          { nome: 'Elevação Frontal', serie: '3x 12', dica: 'Sem balançar o corpo' },
          { nome: 'Tríceps Francês', serie: '3x 12', dica: 'Cotovelos fechados' },
          { nome: 'Crucifixo na Polia', serie: '3x 15', dica: 'Esmague o peito no final' }
        ]
      },
      'B': {
        foco: 'Pernas Completas',
        video: 'https://www.youtube.com/embed/LQvBSjg6gDc',
        exercicios: [
          { nome: 'Agachamento Sumô', serie: '4x 12', dica: 'Pés afastados' },
          { nome: 'Stiff', serie: '4x 12', dica: 'Posterior de coxa' },
          { nome: 'Cadeira Abdutora', serie: '3x 15', dica: 'Segure 2s na abertura' },
          { nome: 'Extensora Unilateral', serie: '3x 12', dica: 'Cada perna' }
        ]
      },
      'C': {
        foco: 'Dorsais em V',
        video: 'https://www.youtube.com/embed/XW7K48-A9xI',
        exercicios: [
          { nome: 'Puxada Triângulo', serie: '4x 12', dica: 'Traga no peito' },
          { nome: 'Remada Unilateral (Serrote)', serie: '3x 12', dica: 'Apoie no banco' },
          { nome: 'Prancha Isométrica', serie: '3x 1 min', dica: 'Abdômen travado' },
          { nome: 'Face Pull', serie: '3x 15', dica: 'Para postura' }
        ]
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router, // <--- Injetando o Router para poder navegar
    private sanitizer: DomSanitizer,
    private auth: Auth,
    private firestore: Firestore,
    private toast: ToastController
  ) {
    addIcons({ water, save, checkmarkDone });
  }

  async ngOnInit() {
    this.tipoTreino = this.route.snapshot.paramMap.get('tipo') || 'A';
    this.biotipo = this.route.snapshot.paramMap.get('biotipo') || 'Mesomorfo';
    this.dataHoje = new Date().toISOString().split('T')[0];

    let grupo = this.dbTreinos[this.biotipo];
    if (!grupo) grupo = this.dbTreinos['Mesomorfo'];
    this.treinoAtual = grupo[this.tipoTreino];

    if (this.treinoAtual && this.treinoAtual.video) {
      this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.treinoAtual.video);
    }

    if (this.treinoAtual.exercicios) {
      this.exerciciosEstado = this.treinoAtual.exercicios.map((ex: any) => ({
        ...ex,
        checked: false
      }));
    }

    await this.carregarProgressoDoDia();
  }

  async carregarProgressoDoDia() {
    const user = this.auth.currentUser;
    if (!user) return;

    const docRef = doc(this.firestore, 'usuarios', user.uid, 'historico_treinos', this.dataHoje);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dadosSalvos = docSnap.data();
      if (dadosSalvos[this.tipoTreino]) {
        const checksSalvos = dadosSalvos[this.tipoTreino];
        for (let i = 0; i < this.exerciciosEstado.length; i++) {
          if (checksSalvos[i]) {
            this.exerciciosEstado[i].checked = true;
          }
        }
      }
    }
  }

  async salvarTreino() {
    const user = this.auth.currentUser;
    if (!user) return;

    // --- VERIFICAÇÃO NOVA ---
    // Verifica se existe pelo menos um item com checked = true
    const algumMarcado = this.exerciciosEstado.some(ex => ex.checked);

    if (!algumMarcado) {
      this.mostrarMensagem('Marque pelo menos um exercício para finalizar! ⚠️', 'warning');
      return; // Para tudo e não sai da tela
    }

    try {
      const progressoParaSalvar = this.exerciciosEstado.map(ex => ex.checked);

      const docRef = doc(this.firestore, 'usuarios', user.uid, 'historico_treinos', this.dataHoje);
      
      await setDoc(docRef, {
        [this.tipoTreino]: progressoParaSalvar,
        ultimaAtualizacao: new Date()
      }, { merge: true });

      // Mensagem de sucesso
      this.mostrarMensagem('Treino salvo! Parabéns pelo foco 💪', 'success');

      // --- MÁGICA DE VOLTAR ---
      // Espera meio segundo para o usuário ler a mensagem e volta para a Home
      setTimeout(() => {
        this.router.navigate(['/home']); 
      }, 500);

    } catch (error) {
      console.error(error);
      this.mostrarMensagem('Erro ao salvar treino.', 'danger');
    }
  }

  async mostrarMensagem(msg: string, cor: string) {
    const t = await this.toast.create({ message: msg, duration: 2000, color: cor, position: 'bottom' });
    t.present();
  }
}