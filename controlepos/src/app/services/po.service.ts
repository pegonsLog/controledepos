import { Injectable, inject, NgZone } from '@angular/core';
import { DocumentData, Firestore, QueryDocumentSnapshot, collection, deleteDoc, doc, getDocs, limit, orderBy, query, setDoc, updateDoc, where, Query, startAfter as firestoreStartAfter, addDoc, collectionData } from '@angular/fire/firestore';
import { Po } from '../modelos/po';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoService {
  private firestore: Firestore = inject(Firestore);
  private posCollection = collection(this.firestore, 'pos');
  // Listar POs com paginação
  async listar(
    pageSize: number,
    startAfter?: QueryDocumentSnapshot<DocumentData>,
    orderByField: string = 'numero_po',
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Promise<{ items: Po[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      // Cria a query base
      let q = query(
        this.posCollection,
        orderBy(orderByField, orderDirection),
        limit(pageSize + 1) // Pegamos 1 a mais para saber se tem mais itens
      ) as Query<DocumentData>;

      // Adiciona o cursor de paginação se existir
      if (startAfter) {
        q = query(q, firestoreStartAfter(startAfter));
      }

      // Executa a consulta
      const querySnapshot = await getDocs(q);
      const items: Po[] = [];
      let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
      let index = 0;

      // Processa os resultados
      querySnapshot.forEach((doc) => {
        if (index < pageSize) {
          items.push({ id: doc.id, ...doc.data() } as Po);
        }
        // Atualiza o último documento visível
        lastVisible = doc;
        index++;
      });

      return { items, lastVisible };
    } catch (error) {
      console.error('Erro ao listar POs:', error);
      throw error;
    }
  }

  // Incluir novo PO
  async incluir(po: Po): Promise<void> {
    await addDoc(this.posCollection, po);
  }

  // Atualizar PO existente (por id)
  async atualizar(id: string, po: Partial<Po>): Promise<void> {
    const docRef = doc(this.firestore, 'pos', id);
    await updateDoc(docRef, po);
  }

  // Excluir PO por numero_po
  async excluir(numero_po: string): Promise<void> {
    const q = query(this.posCollection, where('numero_po', '==', numero_po));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error(`PO com número ${numero_po} não encontrado para exclusão.`);
    }
    const docToDelete = snapshot.docs[0];
    await deleteDoc(doc(this.firestore, 'pos', docToDelete.id));
  }

  // Filtra POs com base em um termo de busca e campo específico
  async filtrar(termo: string, campo: string = 'numero_po'): Promise<Po[]> {
    try {
      console.log(`[PoService] Buscando por '${termo}' no campo '${campo}'`);
      
      // Converte o termo para minúsculas para busca case-insensitive
      const termoBusca = termo.toLowerCase();
      
      // Cria uma referência à coleção
      const posRef = collection(this.firestore, 'pos');
      
      // Primeiro, vamos buscar um documento para verificar a estrutura
      const sampleQuery = query(posRef, limit(1));
      const sampleSnapshot = await getDocs(sampleQuery);
      
      if (!sampleSnapshot.empty) {
        const sampleDoc = sampleSnapshot.docs[0];
        console.log('[PoService] Exemplo de documento encontrado:', {
          id: sampleDoc.id,
          data: sampleDoc.data(),
          camposDisponiveis: Object.keys(sampleDoc.data())
        });
      }
      
      // Cria a consulta
      let q = query(posRef);
      
      // Se houver um termo de busca, adiciona os filtros
      if (termoBusca) {
        console.log(`[PoService] Aplicando filtro: ${campo} >= '${termoBusca}' AND ${campo} <= '${termoBusca}\uf8ff'`);
        q = query(
          posRef,
          where(campo, '>=', termoBusca),
          where(campo, '<=', termoBusca + '\uf8ff'),
          orderBy(campo)  // Adiciona ordenação pelo campo de busca
        );
      }
      
      console.log('[PoService] Query criada:', q);
      const querySnapshot = await getDocs(q);
      console.log('[PoService] Query executada, documentos encontrados:', querySnapshot.size);
      
      const items: Po[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('[PoService] Documento encontrado:', doc.id, data);
        items.push({ 
          id: doc.id, 
          ...data,
          // Garante que os campos de data sejam convertidos corretamente
          data_po: data['data_po']?.toDate ? data['data_po'].toDate() : data['data_po']
        } as Po);
      });
      
      console.log(`[PoService] Total de itens retornados: ${items.length}`);
      return items;
    } catch (error) {
      console.error('[PoService] Erro ao filtrar POs:', error);
      throw error;
    }
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

  // Método para buscar POs com paginação usando Observable
  getPosPaginated(
    pageSize: number,
    queryOptions: {
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>,
      filterField?: string,
      filterValue?: string,
      orderByField?: string,
      orderByDirection?: 'asc' | 'desc'
    } = {}
  ): Observable<{
    data: Po[],
    lastVisibleDocFromQuery: QueryDocumentSnapshot<DocumentData> | null
  }> {
    return from(this.listar(
      pageSize,
      queryOptions.startAfterDoc,
      queryOptions.orderByField,
      queryOptions.orderByDirection
    ).then(({ items, lastVisible }) => ({
      data: items,
      lastVisibleDocFromQuery: lastVisible
    })));
  }



}
