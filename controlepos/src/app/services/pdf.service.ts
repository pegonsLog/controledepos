import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, tap, expand, reduce } from 'rxjs/operators';

export interface PdfFile {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiKey = 'AIzaSyCctrNkfItVOhgb_m43jUzp_O_Qs-ixMf8'; // ⚠️ Substitua pela sua chave da API do Google Drive
  private folderId = '1aEXmecVb3xLOj6lcwy5sswxJn_Uu7mCE'; // ⚠️ Substitua pelo ID da sua pasta
  private apiUrl = 'https://www.googleapis.com/drive/v3/files';

  constructor(private http: HttpClient) { }

  getPdfFiles(): Observable<PdfFile[]> {
    // Log inicial para indicar que o processo de busca de todos os arquivos começou
    console.log('Iniciando busca de todos os PDFs com paginação...');
    return this.fetchPage().pipe(
      expand(response => {
        if (response.nextPageToken) {
          // Log para depuração de cada página que será buscada
          console.log(`Buscando próxima página com token: ${response.nextPageToken}`);
          return this.fetchPage(response.nextPageToken);
        } else {
          // Log para depuração indicando que não há mais páginas
          console.log('Não há mais páginas para buscar.');
          return EMPTY; // Termina a expansão quando não há mais nextPageToken
        }
      }),
      // Acumula os 'files' de cada resposta em um único array
      reduce((acc, response) => acc.concat(response.files), [] as PdfFile[]),
      tap(allFiles => console.log(`Total de arquivos PDF buscados: ${allFiles.length}`)) // Log do total de arquivos ao final
    );
  }

  private fetchPage(pageToken?: string): Observable<{ files: PdfFile[], nextPageToken?: string }> {
    let params = new HttpParams()
      .set('q', `'${this.folderId}' in parents and mimeType='application/pdf' and trashed=false`)
      // Solicita nextPageToken e os campos de arquivo necessários
      .set('fields', 'nextPageToken, files(id, name, webViewLink)') 
      .set('key', this.apiKey)
      .set('pageSize', '1000'); // Define o tamanho máximo da página

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const files = response.files ? response.files.map((file: { name: string; webViewLink: string }) => ({
          name: file.name,
          url: file.webViewLink
        })) : [];
        // Log para cada página buscada
        console.log(`Página buscada. Arquivos nesta página: ${files.length}. Próximo token: ${response.nextPageToken || 'Nenhum'}`);
        return { files, nextPageToken: response.nextPageToken };
      })
    );
  }
}