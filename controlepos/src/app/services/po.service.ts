import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Po } from '../modelos/po';

@Injectable({
  providedIn: 'root'
})
export class PoService {
  private firestore: Firestore = inject(Firestore);
  private posCollection = collection(this.firestore, 'pos');

  constructor() { } 

  // Busca todos os POs
  async getPos(): Promise<Po[]> {
    const snapshot = await getDocs(this.posCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Po));
  }

  // Busca um PO específico pelo seu numero_po
  async getPo(numeroPo: string): Promise<Po | undefined> {
    const q = query(this.posCollection, where('numero_po', '==', numeroPo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return undefined;
    }
    // Assumindo que numero_po é único, pegamos o primeiro (e único) documento.
    const docSnapshot = querySnapshot.docs[0];
    return { id: docSnapshot.id, ...docSnapshot.data() } as Po;
  }

  // Adicionar um novo PO (usando numero_po como ID)
  async addPo(po: Po): Promise<void> {
    if (!po.numero_po) {
      throw new Error('Número do PO é obrigatório para adicionar como ID do documento.');
    }
    const poDocRef = doc(this.firestore, `pos/${po.numero_po}`);
    // Garantir que criado_em e ultima_edicao sejam definidos
    const now = new Date().toISOString();
    po.criado_em = now;
    po.ultima_edicao = now;
    return setDoc(poDocRef, po);
  }

  // Adiciona um novo PO com um ID específico (número do PO)
  async addPoWithId(po: Po): Promise<void> {
    // Validação básica para garantir que o número do PO foi fornecido
    if (!po.numero_po) {
      throw new Error('Número do PO é obrigatório para adicionar com ID específico.');
    }
    const poDocRef = doc(this.firestore, `pos/${po.numero_po}`);
    // Verificar se o documento já existe pode ser uma boa prática, dependendo do caso de uso
    // await setDoc(poDocRef, po, { merge: true }); // Usar merge: true para atualizar se existir, ou criar se não.
    await setDoc(poDocRef, po); // Cria ou sobrescreve completamente
  }

  // Atualizar um PO existente (usando o ID do documento)
  async updatePo(id: string, poData: Partial<Po>): Promise<void> {
    const poDocRef = doc(this.firestore, `pos/${id}`);
    // Garantir que ultima_edicao seja atualizado
    poData.ultima_edicao = new Date().toISOString();
    return updateDoc(poDocRef, poData);
  }

  // Deletar um PO (usando numero_po como ID)
  async deletePo(identificadorPo: string): Promise<void> {
    const q = query(this.posCollection, where('numero_po', '==', identificadorPo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error(`PO com número ${identificadorPo} não encontrado para exclusão.`);
    }
    const docToDelete = querySnapshot.docs[0];
    return deleteDoc(doc(this.firestore, 'pos', docToDelete.id));
  }

  // Verificar se um numero_po já existe
  async checkNumeroPoExists(numeroPo: string): Promise<boolean> {
    const q = query(this.posCollection, where('numero_po', '==', numeroPo));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Novo método para buscar POs com paginação
  async getPosPaginated( 
    pageSize: number, 
    startAfterSnapshot?: QueryDocumentSnapshot<DocumentData> 
  ): Promise<{ data: Po[], lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    
    let q = query(
      this.posCollection, 
      orderBy('numero_po'), // Ordenar por numero_po (ou outro campo apropriado)
      limit(pageSize)
    );

    if (startAfterSnapshot) {
      q = query(
        this.posCollection, 
        orderBy('numero_po'), 
        startAfter(startAfterSnapshot),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Po));
    const lastVisibleDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    return { data, lastVisibleDoc };
  }
}
