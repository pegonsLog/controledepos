import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // HttpClientModule adicionado para standalone
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment'; // Corrigir caminho do import

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private apiKey = environment.googleSheetsApiKey; // Usar apiKey do environment
  private sheetId = '15EzKn5iyziiURj7awjLVtMRYE1swOwdRUpy2Pikr-_k'; // ID da planilha atualizado

  constructor(private http: HttpClient) { }

  private getSheetData(range: string): Observable<string[]> {
    if (!this.apiKey || this.sheetId === 'COLOQUE_O_ID_DA_SUA_PLANILHA_AQUI') {
      console.error('API Key ou Sheet ID não configurados para o GoogleSheetsService.');
      // Em um aplicativo real, você pode querer lançar um erro ou retornar um Observable que emite um erro.
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}?key=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.values) {
          // Transforma a matriz de matrizes em uma única matriz de strings e filtra valores vazios/nulos.
          return response.values.flat().filter((value: any) => value !== null && value !== undefined && String(value).trim() !== '');
        }
        return [];
      })
    );
  }

  getTiposLogradouro(): Observable<string[]> {
    return this.getSheetData('Tipo_Logradouro!A:A');
  }

  getAnalistas(): Observable<string[]> {
    return this.getSheetData('Analista!A:A');
  }

  getFuncionariosResponsaveis(): Observable<string[]> {
    return this.getSheetData('Funcionario!A:A');
  }

  getSituacoes(): Observable<string[]> {
    return this.getSheetData('Situacao!A:A');
  }

  getTiposDeSolicitante(): Observable<string[]> { 
    return this.getSheetData('Solicitante!A:A'); 
  }
}
