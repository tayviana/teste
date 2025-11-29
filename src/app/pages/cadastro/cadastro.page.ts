import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, 
  ToastController, IonButtons, IonBackButton 
} from '@ionic/angular/standalone';

// Imports do Firebase (Auth e Banco)
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton]
})
export class CadastroPage {
  // Dados do formulário
  nome = '';
  email = '';
  senha = '';
  cpf = ''; // Novo campo para o CPF
  peso: number | null = null;
  altura: number | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private toastController: ToastController
  ) {}

  async cadastrar() {
    // 1. Validações Básicas (Campos vazios)
    if (!this.nome || !this.email || !this.senha || !this.peso || !this.altura || !this.cpf) {
      this.mostrarMensagem('Preencha todos os campos!', 'warning');
      return;
    }

    // 2. Validação Rigorosa de E-mail
    // Verifica se tem formato xxxx@xxxx.xx (ex: @gmail.com)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.email)) {
      this.mostrarMensagem('Digite um e-mail válido (ex: nome@gmail.com)', 'warning');
      return;
    }

    // 3. Validação de CPF
    if (!this.validarCPF(this.cpf)) {
      this.mostrarMensagem('CPF inválido! Verifique os números.', 'warning');
      return;
    }

    // 4. Validação Personalizada de Senha (Segurança extra)
    if (this.senha === '123456' || this.senha === '12345678' || this.senha === 'password' || this.senha === 'senha123') {
      this.mostrarMensagem('Essa senha é muito óbvia! Crie uma senha mais forte.', 'warning');
      return;
    }

    if (this.senha.length < 6) {
      this.mostrarMensagem('A senha deve ter no mínimo 6 caracteres.', 'warning');
      return;
    }

    try {
      // 5. Cria o usuário na Autenticação (Login/Senha)
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.senha);
      const userId = userCredential.user.uid;

      // --- CORREÇÃO DE ALTURA ---
      // Se o usuário digitou em cm (ex: 175), convertemos para metros (1.75)
      let alturaCorrigida = this.altura;
      if (alturaCorrigida > 3) {
        alturaCorrigida = alturaCorrigida / 100;
      }

      // --- CÁLCULO DE BIOTIPO AUTOMÁTICO ---
      const imc = this.peso / (alturaCorrigida * alturaCorrigida);
      let biotipoCalculado = '';

      // Regra matemática do IMC para os Biotipos
      if (imc < 18.5) {
        biotipoCalculado = 'Ectomorfo'; // Magro
      } else if (imc >= 18.5 && imc < 25) {
        biotipoCalculado = 'Mesomorfo'; // Atlético/Normal
      } else {
        biotipoCalculado = 'Endomorfo'; // Acima do peso
      }

      console.log('IMC:', imc, 'Biotipo:', biotipoCalculado); 

      // 6. Salva os dados extras no Banco de Dados (Firestore)
      await setDoc(doc(this.firestore, 'usuarios', userId), {
        nome: this.nome,
        email: this.email,
        cpf: this.cpf, // Salvando o CPF no banco
        peso: this.peso,
        altura: alturaCorrigida,
        biotipo: biotipoCalculado, // Salva o biotipo calculado
        dataCadastro: new Date()
      });

      this.mostrarMensagem('Conta criada com sucesso! Bem-vindo(a)!', 'success');
      this.router.navigate(['/home']); // Manda para a Home após cadastrar

    } catch (error: any) {
      console.error(error);
      
      // --- TRADUÇÃO DOS ERROS DO FIREBASE ---
      let mensagem = 'Erro ao cadastrar.';
      
      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Este e-mail já possui cadastro. Tente fazer login.';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'A senha é muito fraca (mínimo 6 caracteres).';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'O formato do e-mail é inválido.';
      } else if (error.code === 'auth/operation-not-allowed') {
        mensagem = 'O cadastro por e-mail/senha não está ativado no Firebase.';
      }
      
      this.mostrarMensagem(mensagem, 'danger');
    }
  }

  // Função auxiliar para validar CPF (Algoritmo oficial)
  validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos (pontos e traços)
    cpf = cpf.replace(/[^\d]+/g, '');

    // Verifica se tem 11 dígitos ou se todos são iguais (ex: 111.111.111-11)
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  async mostrarMensagem(texto: string, cor: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 3000,
      color: cor,
      position: 'bottom'
    });
    toast.present();
  }
}