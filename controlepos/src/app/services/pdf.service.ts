import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY, of } from 'rxjs';
import { map, tap, expand, reduce } from 'rxjs/operators';

export interface PdfFile {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private apiKey = 'AIzaSyCctrNkfItVOhgb_m43jUzp_O_Qs-ixMf8';
  private folderIdBarreiro = '195Tc-zdo5o30AVQ-hrWJriAFXl7yoFFc';
  private folderIdOeste = '1aEXmecVb3xLOj6lcwy5sswxJn_Uu7mCE';
  private apiUrl = 'https://www.googleapis.com/drive/v3/files';

  constructor(private http: HttpClient) { }

  private getFolderId(folderIdentifier: string): string | null {
    if (folderIdentifier.toLowerCase() === 'oeste') {
      return this.folderIdOeste;
    } else if (folderIdentifier.toLowerCase() === 'barreiro') {
      return this.folderIdBarreiro;
    }
    return null;
  }

  // Busca PDFs diretamente no Google Drive com termo de pesquisa
  searchPdfFiles(folderIdentifier: string, searchTerm: string): Observable<PdfFile[]> {
    const folderId = this.getFolderId(folderIdentifier);
    if (!folderId) {
      console.error('Identificador de pasta inválido:', folderIdentifier);
      return EMPTY;
    }

    if (!searchTerm || searchTerm.trim() === '') {
      return of([]); // Retorna lista vazia se não houver termo de busca
    }

    return this.fetchPageWithSearch(folderId, searchTerm).pipe(
      expand(response => {
        if (response.nextPageToken) {
          return this.fetchPageWithSearch(folderId, searchTerm, response.nextPageToken);
        }
        return EMPTY;
      }),
      reduce((acc, response) => acc.concat(response.files), [] as PdfFile[])
    );
  }

  private fetchPageWithSearch(folderId: string, searchTerm: string, pageToken?: string): Observable<{ files: PdfFile[], nextPageToken?: string }> {
    // Escapa caracteres especiais no termo de busca
    const escapedTerm = searchTerm.replace(/'/g, "\\'");

    const query = `'${folderId}' in parents and mimeType='application/pdf' and name contains '${escapedTerm}' and trashed=false`;

    let params = new HttpParams()
      .set('q', query)
      .set('fields', 'nextPageToken, files(id, name, webViewLink)')
      .set('key', this.apiKey)
      .set('pageSize', '100');

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const files = response.files ? response.files.map((file: { name: string; webViewLink: string }) => ({
          name: file.name,
          url: file.webViewLink
        })) : [];
        return { files, nextPageToken: response.nextPageToken };
      })
    );
  }
}
