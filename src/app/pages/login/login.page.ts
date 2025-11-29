import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, 
  ToastController 
} from '@ionic/angular/standalone';

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html', // Garanta que o arquivo HTML existe e tem esse nome
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonItem, IonLabel, IonInput, IonButton
  ]
})
export class LoginPage {
  email = '';
  senha = '';

  constructor(
    private auth: Auth, 
    private firestore: Firestore, 
    private router: Router,
    private toastController: ToastController
  ) {}

  async logar() {
    // 1. Validação Básica
    if (!this.email || !this.senha) {
      this.mostrarErro('Por favor, digite seu e-mail e senha.');
      return;
    }

    // 2. Atalho para Admin (Hardcoded) - Útil para testes
    if (this.email === 'admin@vivafit.com' && this.senha === 'admin123') {
      this.router.navigate(['/admin']);
      return;
    }

    try {
      // 3. Login real no Firebase
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.senha);
      const user = userCredential.user;

      // 4. Verifica no Banco de Dados se o usuário é Admin
      const docSnap = await getDoc(doc(this.firestore, 'usuarios', user.uid));
      
      if (docSnap.exists()) {
        const dados = docSnap.data();
        
        // Se o campo 'role' for 'admin', manda para o painel administrativo
        if (dados['role'] === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          // Caso contrário, é um aluno normal, manda para a Home
          this.router.navigate(['/home']);
        }
      } else {
        // Se não achar dados (erro raro), manda para a Home por segurança
        this.router.navigate(['/home']);
      }

    } catch (error: any) {
      console.error(error); 
      
      // Tradução dos erros do Firebase para Português
      let mensagem = 'Erro ao tentar entrar.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        mensagem = 'Conta não encontrada. Verifique o e-mail.';
      } else if (error.code === 'auth/wrong-password') {
        mensagem = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/too-many-requests') {
        mensagem = 'Muitas tentativas falhas. Aguarde um pouco.';
      }
      
      this.mostrarErro(mensagem);
    }
  }

  async mostrarErro(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: 'danger', // Cor vermelha para erros
      position: 'bottom'
    });
    toast.present();
  }
}