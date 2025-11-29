import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButtons, IonBackButton, IonItem, IonLabel, 
  IonTextarea, IonButton, IonIcon, ToastController, IonFooter 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, arrowBack, grid, statsChart, person, logOutOutline } from 'ionicons/icons';

import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButtons, IonBackButton, IonItem, IonLabel, 
    IonTextarea, IonButton, IonIcon, IonFooter
  ]
})
export class PerfilPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  userData: any = {};
  novaBio = '';
  fotoPreview = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private toast: ToastController,
    private router: Router
  ) { 
    addIcons({ camera, arrowBack, grid, statsChart, person, logOutOutline });
  }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.carregarDados(user.uid);
    }
  }

  async carregarDados(uid: string) {
    try {
      const snap = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (snap.exists()) {
        this.userData = snap.data();
        this.novaBio = this.userData.bio || '';
        this.fotoPreview = this.userData.fotoBase64 || '';
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }

  // Aciona o clique no input invisível (para PC e Mobile)
  triggerUpload() {
    this.fileInput.nativeElement.click();
  }

  // Quando o ficheiro é selecionado
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result; // Mostra a prévia na hora
      };
      reader.readAsDataURL(file);
    }
  }

  async salvarPerfil() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(this.firestore, 'usuarios', user.uid), {
        bio: this.novaBio,
        fotoBase64: this.fotoPreview // Salva a foto no banco
      });
      const t = await this.toast.create({ message: 'Perfil salvo com sucesso!', duration: 2000, color: 'success' });
      t.present();
    } catch (error) {
      console.error(error);
      const t = await this.toast.create({ message: 'Erro ao salvar. Foto muito grande?', duration: 2000, color: 'danger' });
      t.present();
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}