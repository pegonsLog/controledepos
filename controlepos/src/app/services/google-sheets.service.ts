import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Usuario } from '../modelos/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private apiKey = environment.googleSheetsApiKey;
  // ID da planilha principal para dados de POs (Oeste, Barreiro)
  private poSheetId = '1AQjzxBPFKxwfAGolCxvzOEcQBs5Z-0yKUKIxsjDXdAI';
  // ID da planilha para dados dos dropdowns
  private dropdownSheetId = '15EzKn5iyziiURj7awjLVtMRYE1swOwdRUpy2Pikr-_k';
  // ID da planilha para dados dos usuários
  private usuariosSheetId = '1QR2knxBd_fzNklKZzPRaEw_8Sc00CLnbGJuk-9Hcj9U';

  // URL do Google App Script (substitua pela sua URL de implantação)
  private appScriptUrl = 'https://script.google.com/macros/s/AKfycbw7OGaLufFYdha5QQr5bjSZceJi5M4pJfpgTSi8QycjyTL7zNKqQK27t7y5P-6WKc1-/exec';

  constructor(private http: HttpClient) { }

  private _getSheetData(sheetId: string, range: string): Observable<any[][]> {
    if (!this.apiKey || !sheetId || sheetId.startsWith('COLOQUE_O_ID')) {
      console.error('API Key ou Sheet ID não configurados corretamente para o GoogleSheetsService.');
      return of([]); // Retorna um Observable de array vazio
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.values) {
          return response.values as any[][];
        }
        return [];
      })
    );
  }

  // Método para buscar dados da planilha principal de POs
  public getPoSheetData(rangeWithSheetName: string): Observable<any[][]> {
    // Ex: rangeWithSheetName pode ser 'Oeste!A:Z'
    return this._getSheetData(this.poSheetId, rangeWithSheetName);
  }

  // Método para buscar dados da planilha de dropdowns e retornar como string[] (primeira coluna)
  private getDropdownData(sheetNameForDropdown: string): Observable<string[]> {
    // Busca a coluna A inteira da aba especificada na planilha de dropdowns
    const range = `${sheetNameForDropdown}!A:A`;
    return this._getSheetData(this.dropdownSheetId, range).pipe(
      map(data => {
        if (!data || data.length === 0) {
          return [];
        }
        // Pega o primeiro item de cada linha (array interno) e filtra vazios/nulos
        return data.map(row => row[0]).filter(value => value != null && value !== '');
      })
    );
  }

  // Métodos para os dropdowns atualizados
  getTiposLogradouro(): Observable<string[]> {
    return this.getDropdownData('Tipo_Logradouro');
  }

  getAnalistas(): Observable<string[]> {
    return this.getDropdownData('Analista');
  }

  getFuncionariosResponsaveis(): Observable<string[]> {
    return this.getDropdownData('Funcionario');
  }

  getSituacoes(): Observable<string[]> {
    return this.getDropdownData('Situacao');
  }

  getTiposDeSolicitante(): Observable<string[]> {
    return this.getDropdownData('Solicitante');
  }

  public getUsuarios(): Observable<Usuario[]> {
    // Assume que a aba se chama 'Usuarios' e as colunas são: usuario, nome, senha, perfil
    const range = 'Usuarios!A:D'; // Busca as colunas A (usuario), B (nome), C (senha), D (perfil)
    return this._getSheetData(this.usuariosSheetId, range).pipe(
      map(data => {
        if (!data || data.length < 2) { // Precisa de pelo menos cabeçalho e uma linha de dados
          return [];
        }
        // Ignora a primeira linha (cabeçalho)
        const usuariosData = data.slice(1);
        return usuariosData.map(row => {
          return {
            usuario: row[0],
            nome: row[1],
            senha: row[2],
            perfil: row[3]
          } as Usuario;
        }).filter(u => u.usuario && u.senha && u.perfil); // Filtra linhas incompletas
      })
    );
  }

  // Operações de escrita/deleção via App Script
  // O payload deve ser estruturado conforme o App Script espera

  // public addSheetData(poData: any, sheetName: string): Observable<any> {
  //   const payload = {
  //     action: 'addPo',
  //     sheetName: sheetName,
  //     data: poData // O objeto PO completo
  //   };
  //   return this.http.post<any>(this.appScriptUrl, payload);
  // }

  public addSheetData(poData: any, sheetName: string): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'addPo');
    formData.append('sheetName', sheetName);
    formData.append('data', JSON.stringify(poData)); // serializa o objeto
  
    return this.http.post(this.appScriptUrl, formData);
  }
  

  // public updateSheetData(poData: any, sheetName: string, numero_po: string): Observable<any> {
  //   const payload = {
  //     action: 'updatePo',
  //     sheetName: sheetName,
  //     numero_po: numero_po, // Identificador da linha para atualizar
  //     data: poData // O objeto PO completo com as atualizações
  //   };
  //   return this.http.post<any>(this.appScriptUrl, payload);
  // }

  public updateSheetData(poData: any, sheetName: string, numero_po: string): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'updatePo');
    formData.append('sheetName', sheetName);
    formData.append('numero_po', numero_po);
    formData.append('data', JSON.stringify(poData)); // serializa o objeto
  
    return this.http.post(this.appScriptUrl, formData);
  }
  
  public deleteSheetDataByPoNumber(numero_po: string, sheetName: string): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'deletePoByNumero');
    formData.append('sheetName', sheetName);
    formData.append('numero_po', numero_po);
    formData.append('data', JSON.stringify(numero_po)); // serializa o objeto
  
    return this.http.post(this.appScriptUrl, formData);
  }
}
