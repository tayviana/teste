import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  addDoc, 
  collection, 
  collectionData, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction
} from '@angular/fire/firestore';
import { PlanoAlimentar, Refeicao } from '../models/dieta.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DietaService {
  private firestore = inject(Firestore);

  // SALVAR PLANO ALIMENTAR
  async salvarPlanoAlimentar(plano: PlanoAlimentar) {
    const planosRef = collection(this.firestore, 'planos-alimentares');
    return await addDoc(planosRef, plano);
  }

  // BUSCAR PLANOS DO USUÁRIO
  getPlanosPorUsuario(userId: string) {
    const planosRef = collection(this.firestore, 'planos-alimentares');
    const q = query(
      planosRef, 
      where('userId', '==', userId), 
      orderBy('data', 'desc')
    );
    
    return collectionData(q, { idField: 'id' });
  }

  // BUSCAR PLANO POR DATA
  getPlanoPorData(userId: string, data: string) {
    const planosRef = collection(this.firestore, 'planos-alimentares');
    const q = query(
      planosRef, 
      where('userId', '==', userId), 
      where('data', '==', data)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(planos => planos.length > 0 ? planos[0] as PlanoAlimentar : null)
    );
  }

  // ATUALIZAR PLANO EXISTENTE
  async atualizarPlanoAlimentar(id: string, plano: Partial<PlanoAlimentar>) {
    const planoRef = doc(this.firestore, 'planos-alimentares', id);
    return await updateDoc(planoRef, plano);
  }

  // ADICIONAR REFEIÇÃO AO PLANO
  async adicionarRefeicao(planoId: string, refeicao: Refeicao) {
    const planoRef = doc(this.firestore, 'planos-alimentares', planoId);
    
    return await runTransaction(this.firestore, async (transaction) => {
      const planoDoc = await transaction.get(planoRef);
      if (!planoDoc.exists()) {
        throw new Error('Plano não encontrado');
      }

      const plano = planoDoc.data() as PlanoAlimentar;
      const novasRefeicoes = [...plano.refeicoes, refeicao];
      
      // Atualizar totais
      const atualizacao = {
        refeicoes: novasRefeicoes,
        totalCalorias: plano.totalCalorias + refeicao.calorias,
        totalProteinas: plano.totalProteinas + refeicao.proteinas,
        totalCarboidratos: plano.totalCarboidratos + refeicao.carboidratos,
        totalGorduras: plano.totalGorduras + refeicao.gorduras
      };

      transaction.update(planoRef, atualizacao);
    });
  }

  // DELETAR PLANO
  async deletarPlano(id: string) {
    const planoRef = doc(this.firestore, 'planos-alimentares', id);
    return await deleteDoc(planoRef);
  }
}