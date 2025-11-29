import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonList, IonSelect, IonSelectOption,
  ToastController, IonSpinner // <--- ADICIONADO AQUI
} from '@ionic/angular/standalone';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-usuario-detalhe',
  templateUrl: './usuario-detalhe.page.html',
  styleUrls: ['./usuario-detalhe.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonButton, 
    IonAvatar, IonList, IonSelect, IonSelectOption,
    IonSpinner // <--- ADICIONADO AQUI TAMBÉM
  ]
})
export class UsuarioDetalhePage implements OnInit {
  userId: string | null = null;
  usuario: any = {};
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      await this.carregarUsuario();
    }
  }

  async carregarUsuario() {
    this.loading = true;
    if (!this.userId) return;

    const docRef = doc(this.firestore, 'usuarios', this.userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.usuario = docSnap.data();
    } else {
      this.mostrarToast('Usuário não encontrado.', 'danger');
      this.router.navigate(['/admin']);
    }
    this.loading = false;
  }

  async salvarAlteracoes() {
    if (!this.userId) return;

    try {
      const docRef = doc(this.firestore, 'usuarios', this.userId);
      // Atualiza apenas os campos permitidos
      await updateDoc(docRef, {
        peso: Number(this.usuario.peso),
        altura: Number(this.usuario.altura),
        biotipo: this.usuario.biotipo,
        cpf: this.usuario.cpf
      });
      this.mostrarToast('Usuário atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      this.mostrarToast('Erro ao salvar alterações.', 'danger');
    }
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color
    });
    toast.present();
  }
}