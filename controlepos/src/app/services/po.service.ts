import { Injectable } from '@angular/core';
import { Po } from '../modelos/po'; // Supondo que a interface Po esteja correta
import { Observable, of } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PoService {

  private posCache$: Observable<Po[]> | null = null;
  private lastSheetNameForCache: string | null = null;

  constructor(private googleSheetsService: GoogleSheetsService) {}

  private normalizeHeader(header: string): string {
    if (!header) return '';
    return header
      .normalize("NFD") // Decompõe caracteres acentuados (e.g., 'ú' -> 'u' + '´')
      .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_") // Substitui espaços por underscores
      .replace(/[^a-z0-9_]/g, ""); // Remove quaisquer caracteres restantes que não sejam letras minúsculas, números ou underscore
  }

  private mapSheetDataToPos(dados: any[][]): Po[] {
    if (!dados || dados.length < 2) {
      return [];
    }
    const [cabecalhoOriginal, ...linhas] = dados;
    // Normaliza todos os cabeçalhos primeiro
    const cabecalho = cabecalhoOriginal.map(h => this.normalizeHeader(h));

    const pos: Po[] = linhas.map((linha) => {
      const po: any = {};
      cabecalho.forEach((key: string, i: number) => {
        // Se a normalização resultar em uma chave vazia (ex: coluna com apenas símbolos especiais), ignora.
        if (key) {
          po[key] = linha[i] !== undefined ? linha[i] : null;
        }
      });
      return po as Po;
    }).filter(po => po.numero_po); // Garante que apenas POs com numero_po sejam retornados
    return pos;
  }

  private applyFilter(pos: Po[], filtro: string): Po[] {
    if (!filtro || filtro.trim() === '') {
      return pos;
    }
    const filtroLower = filtro.trim().toLowerCase();
    return pos.filter(item =>
      Object.values(item).some(valor =>
        valor && valor.toString().toLowerCase().includes(filtroLower)
      )
    );
  }

  listar(sheetName: string, filtro: string = ''): Observable<Po[]> {
    if (this.posCache$ && this.lastSheetNameForCache === sheetName) {
      // Cache existe e é para a mesma planilha
      return this.posCache$.pipe(
        map(pos => this.applyFilter(pos, filtro))
      );
    }

    // Cache não existe, é para outra planilha, ou foi invalidado
    this.lastSheetNameForCache = sheetName;
    this.posCache$ = this.googleSheetsService.getPoSheetData(`${sheetName}!A:Z`).pipe(
      map((dados: any[][]) => this.mapSheetDataToPos(dados)),
      tap(pos => console.log(`Cache populado para ${sheetName} com ${pos.length} itens.`)),
      shareReplay(1), // Compartilha a última emissão e mantém o cache
      catchError(error => {
        console.error(`Erro ao buscar e popular cache para ${sheetName}:`, error);
        this.posCache$ = null; // Invalida o cache em caso de erro na fonte
        this.lastSheetNameForCache = null;
        return of([]); // Retorna array vazio em caso de erro
      })
    );

    return this.posCache$.pipe(
      map(pos => this.applyFilter(pos, filtro))
    );
  }

  public invalidateCache(): void {
    this.posCache$ = null;
    this.lastSheetNameForCache = null;
    console.log('Cache de POs invalidado.');
  }

  getPoByNumeroPo(numero_po: string, sheetName: string): Observable<Po | undefined> {
    return this.listar(sheetName).pipe(
      map(pos => pos.find(p => p.numero_po === numero_po))
    );
  }

  adicionarPo(po: Po, sheetName: string): Observable<any> {
    // O GoogleSheetsService.addSheetData espera o objeto PO
    // O App Script precisará saber como mapear isso para as colunas da planilha
    return this.googleSheetsService.addSheetData(po, sheetName).pipe(
      tap(() => this.invalidateCache()),
      catchError(error => {
        console.error(`Erro ao adicionar PO na aba ${sheetName}:`, error);
        throw error; // Re-throw para ser tratado no componente
      })
    );
  }

  atualizarPo(po: Po, sheetName: string): Observable<any> {
    if (!po.numero_po) {
      console.error('Número do PO é necessário para atualização.');
      return of({ error: 'Número do PO não fornecido.' }); // Ou lançar um erro
    }
    // O GoogleSheetsService.updateSheetData espera o objeto PO e o numero_po como identificador
    return this.googleSheetsService.updateSheetData(po, sheetName, po.numero_po).pipe(
      tap(() => this.invalidateCache()),
      catchError(error => {
        console.error(`Erro ao atualizar PO ${po.numero_po} na aba ${sheetName}:`, error);
        throw error; // Re-throw para ser tratado no componente
      })
    );
  }

  excluir(numero_po: string, sheetName: string): Observable<any> {
    return this.googleSheetsService.deleteSheetDataByPoNumber(numero_po, sheetName).pipe(
      tap(() => this.invalidateCache()),
      catchError(error => {
        console.error(`Erro ao excluir PO ${numero_po} na aba ${sheetName}:`, error);
        throw error; // Re-throw para ser tratado no componente
      })
    );
  }
}
