import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Po } from '../modelos/po';

export interface CachedSearchEntry {
  sheetName: string; // Primary key
  data: Po[];
  timestamp: number;
}

export class AppDB extends Dexie {
  cachedSearches!: Table<CachedSearchEntry, string>; // string = type of primary key (sheetName)

  constructor() {
    super('ControlePosDB'); // Database name
    this.version(1).stores({
      cachedSearches: 'sheetName, timestamp' // Primary key: sheetName, Index: timestamp
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private db: AppDB;

  constructor() {
    this.db = new AppDB();
  }

  async setDadosPesquisa(sheetName: string, data: Po[]): Promise<void> {
    try {
      await this.db.cachedSearches.put({
        sheetName,
        data,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Erro ao salvar dados no IndexedDB:', e);
      // Opcional: Lançar o erro novamente ou tratar de forma específica
    }
  }

  async getDadosPesquisa(sheetName: string): Promise<Po[] | undefined> {
    try {
      const cachedEntry = await this.db.cachedSearches.get(sheetName);
      return cachedEntry?.data;
    } catch (e) {
      console.error('Erro ao ler dados do IndexedDB:', e);
      return undefined;
    }
  }

  async limparDadosPesquisa(): Promise<void> {
    try {
      await this.db.cachedSearches.clear();
      console.log('Cache (IndexedDB) limpo com sucesso.');
    } catch (e) {
      console.error('Erro ao limpar dados do IndexedDB:', e);
    }
  }
}
