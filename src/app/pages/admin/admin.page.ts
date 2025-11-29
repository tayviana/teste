import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonList, IonItem, IonLabel, IonButton, 
  IonIcon, IonSearchbar, AlertController, ToastController, 
  IonButtons, IonBackButton, IonBadge, IonCard, IonCardContent, 
  IonListHeader, IonAvatar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pencil, trash, person, search, shield, shieldOutline } from 'ionicons/icons';

// Firebase
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink, // Importante para o HTML funcionar
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonList, IonItem, IonLabel, IonButton, 
    IonIcon, IonSearchbar, IonButtons, IonBackButton, IonBadge,
    IonCard, IonCardContent, IonListHeader, IonAvatar
  ]
})
export class AdminPage implements OnInit {
  listaUsuarios: any[] = [];
  listaFiltrada: any[] = [];

  constructor(
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ pencil, trash, person, search, shield, shieldOutline });
  }

  async ngOnInit() {
    await this.carregarTodosUsuarios();
  }

  // Carrega usuários toda vez que entra na tela (para atualizar se voltar do detalhe)
  ionViewWillEnter() {
    this.carregarTodosUsuarios();
  }

  async carregarTodosUsuarios() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'usuarios'));
      
      this.listaUsuarios = querySnapshot.docs.map(d => {
        return { id: d.id, ...d.data() };
      });
      this.listaFiltrada = [...this.listaUsuarios];
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  }

  filtrarUsuarios(event: any) {
    const termo = event.target.value.toLowerCase();
    if (!termo) {
      this.listaFiltrada = [...this.listaUsuarios];
      return;
    }
    
    this.listaFiltrada = this.listaUsuarios.filter((user: any) => {
      const nomeMatch = user.nome?.toLowerCase().includes(termo);
      const emailMatch = user.email?.toLowerCase().includes(termo);
      return nomeMatch || emailMatch;
    });
  }

  // NOVA FUNÇÃO: Navega para detalhes (usada no clique do item)
  abrirDetalhes(user: any) {
    this.router.navigate(['/admin/usuario-detalhe', user.id]);
  }

  // --- FUNÇÃO PARA PROMOVER/REBAIXAR ADMIN ---
  async toggleAdmin(user: any, event: Event) {
    event.stopPropagation(); // PARA A PROPAGAÇÃO DO CLIQUE AQUI!

    // Verifica se o usuário é admin
    const isCurrentlyAdmin = user.role === 'admin';
    
    // Define os textos
    const titulo = isCurrentlyAdmin ? 'Remover Admin?' : 'Tornar Admin?';
    const acao = isCurrentlyAdmin ? 'REMOVER os poderes de' : 'DAR poderes de Administrador para';
    const botaoTexto = isCurrentlyAdmin ? 'Sim, Remover' : 'Sim, Promover';
    const novoRole = isCurrentlyAdmin ? 'user' : 'admin'; // Inverte o papel

    const alert = await this.alertCtrl.create({
      header: titulo,
      // Usamos MAIÚSCULAS no nome para destacar sem bugar o HTML
      message: `Tem certeza que deseja ${acao} ${user.nome ? user.nome.toUpperCase() : 'ESTE USUÁRIO'}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: botaoTexto,
          handler: async () => {
            await this.salvarAdminStatus(user.id, novoRole);
          }
        }
      ]
    });
    await alert.present();
  }

  async salvarAdminStatus(id: string, novoRole: string) {
    try {
      const docRef = doc(this.firestore, 'usuarios', id);
      await updateDoc(docRef, { role: novoRole });
      
      const msg = novoRole === 'admin' ? 'Novo Admin promovido!' : 'Admin removido com sucesso.';
      this.mostrarToast(msg, 'success');
      
      this.carregarTodosUsuarios(); // Atualiza a lista na tela
    } catch (error) {
      this.mostrarToast('Erro ao atualizar permissões.', 'danger');
    }
  }

  // Função para excluir usuário
  async excluirUsuario(id: string, event: Event) {
    event.stopPropagation(); // Impede de abrir a página de detalhes

    const alert = await this.alertCtrl.create({
      header: 'Cuidado!',
      message: 'Tem certeza que deseja excluir este usuário permanentemente?',
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, Excluir',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, 'usuarios', id));
              this.mostrarToast('Usuário removido com sucesso.', 'success');
              this.carregarTodosUsuarios(); // Atualiza a lista
            } catch (error) {
              this.mostrarToast('Erro ao excluir.', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(msg: string, cor: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: cor });
    t.present();
  }
}