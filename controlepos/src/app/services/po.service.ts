import { Injectable } from '@angular/core';
import { Po } from '../modelos/po';
import { Observable } from 'rxjs';
import { GoogleSheetsService } from './google-sheets.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PoService {

  constructor(private googleSheetsService: GoogleSheetsService) {}

  listar(filtro: string = ''): Observable<Po[]> {
    // Aqui você pode adaptar para buscar de uma aba específica, se necessário
    // Exemplo: return this.googleSheetsService.getSheetData('Oeste!A:Z')
    // e mapear para Po[]
    // Supondo que haja um método público para buscar dados brutos; caso contrário, altere getSheetData para public
    return this.googleSheetsService.getSheetData('Oeste!A:Z').pipe(
      // Adaptar o mapeamento conforme o formato dos dados retornados
      // Supondo que a primeira linha seja o cabeçalho
      map((dados: any[]) => {
        if (!dados || dados.length < 2) {
          return [];
        }
        const [cabecalho, ...linhas] = dados;

        const pos: Po[] = linhas.map((linha, index) => {
          const po: any = {};
          cabecalho.forEach((campo: string, i: number) => {
            po[campo] = linha[i];
          });
          return po as Po;
        });
        const posFiltrados = !filtro ? pos : pos.filter(item =>
          Object.values(item).some(valor =>
            valor && valor.toString().toLowerCase().includes(filtro.trim().toLowerCase())
          )
        );
        return posFiltrados;
      })
    );
  }

  // Métodos para adicionar/atualizar POs podem ser implementados aqui caso você exponha um endpoint customizado
  // ou use um App Script no Google Sheets. Caso contrário, a API pública só permite leitura.

  excluir(numero_po: string): Observable<any> {
    // TODO: Implementar o método 'deleteSheetDataByPoNumber' no GoogleSheetsService.
    // Este método no GoogleSheetsService deverá chamar o App Script para excluir a linha.
    // O App Script precisará localizar a linha pelo numero_po e então deletá-la.
    // O range 'Oeste!A:Z' é um exemplo, ajuste conforme necessário.
    return this.googleSheetsService.deleteSheetDataByPoNumber(numero_po, 'Oeste!A:Z');
  }
}
