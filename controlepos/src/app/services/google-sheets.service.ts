import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // HttpClientModule adicionado para standalone
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment'; // Corrigir caminho do import

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private apiKey = environment.googleSheetsApiKey; // Usar apiKey do environment
  private sheetId = '1AQjzxBPFKxwfAGolCxvzOEcQBs5Z-0yKUKIxsjDXdAI'; // ID da planilha atualizado

  constructor(private http: HttpClient) { }

  public getSheetData(range: string): Observable<string[]> {
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
        if (response && response.values) {
          // Retorna a estrutura original de linhas e colunas
          return response.values; // response.values é any[][]
        }
        // Se não houver valores, retorna uma matriz vazia para evitar erros no serviço consumidor
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

  public deleteSheetDataByPoNumber(numero_po: string, sheetName: string): Observable<any> {
    // TODO: Substitua pela URL de implantação do seu Google App Script.
    const appScriptUrl = 'https://script.google.com/macros/s/YOUR_APP_SCRIPT_DEPLOYMENT_ID/exec';

    // TODO: Ajuste o payload conforme o que seu App Script espera.
    // Exemplo: o App Script pode esperar uma ação, o nome da aba e o identificador.
    const payload = {
      action: 'deletePoByNumero', // Ação que seu App Script irá identificar
      sheetName: sheetName,       // Ex: 'Oeste', 'Barreiro'
      numero_po: numero_po        // O número do PO para identificar a linha a ser excluída
    };

    // Geralmente, App Scripts para operações de escrita são configurados para aceitar POST.
    // Pode ser necessário configurar o CORS no seu App Script.
    return this.http.post<any>(appScriptUrl, payload).pipe(
      map(response => {
        // TODO: Processe a resposta do seu App Script conforme necessário.
        // Ele pode retornar uma mensagem de sucesso/falha ou um status.
        console.log('Resposta do App Script (exclusão):', response);
        return response;
      })
      // Considere adicionar catchError para tratar erros HTTP aqui.
    );
  }
}
