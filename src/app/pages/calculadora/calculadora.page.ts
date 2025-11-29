import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para o *ngIf e Pipes
import { FormsModule } from '@angular/forms';   // Necessário para o [(ngModel)]
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, 
  IonCard, IonCardHeader, IonCardTitle, 
  IonCardSubtitle, IonCardContent 
} from '@ionic/angular/standalone'; // <--- IMPORTS DO IONIC

@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.page.html',
  styleUrls: ['./calculadora.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonItem, IonLabel, IonInput, IonButton, 
    IonCard, IonCardHeader, IonCardTitle, 
    IonCardSubtitle, IonCardContent
  ] // <--- AQUI QUE A MÁGICA ACONTECE
})
export class CalculadoraPage {
  peso: number | null = null;
  altura: number | null = null;
  resultadoIMC: number = 0; // Nome correto da variável
  classificacao: string = '';
  sugestaoTreino: string = '';

  constructor() {}

  calcular() {
    if (this.peso && this.altura) {
      this.resultadoIMC = this.peso / (this.altura * this.altura);
      this.definirPlano(this.resultadoIMC);
    }
  }

  definirPlano(imc: number) {
    if (imc < 18.5) {
      this.classificacao = 'Abaixo do peso';
      this.sugestaoTreino = 'Treino de Hipertrofia (Ganho de Massa).';
    } else if (imc >= 18.5 && imc < 24.9) {
      this.classificacao = 'Peso Normal';
      this.sugestaoTreino = 'Manutenção e Definição.';
    } else if (imc >= 25) {
      this.classificacao = 'Sobrepeso';
      this.sugestaoTreino = 'Treino de Queima de Gordura (HIIT).';
    }
  }
}