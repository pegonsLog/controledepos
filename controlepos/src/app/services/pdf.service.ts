import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY, of, timer } from 'rxjs';
import { map, expand, reduce, timeout, retry, catchError, tap, shareReplay } from 'rxjs/operators';

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

  // Cache de todos os PDFs por pasta
  private cacheAllPdfs: Map<string, PdfFile[]> = new Map();
  private cacheLoading: Map<string, Observable<PdfFile[]>> = new Map();

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

    // Se já temos cache, filtra localmente (instantâneo)
    if (this.cacheAllPdfs.has(folderId)) {
      const cached = this.cacheAllPdfs.get(folderId)!;
      const filtered = cached.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return of(filtered);
    }

    // Se já está carregando, reutiliza o observable em andamento
    if (this.cacheLoading.has(folderId)) {
      return this.cacheLoading.get(folderId)!.pipe(
        map(files => files.filter(file =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Primeira busca: carrega todos os PDFs, salva no cache e filtra
    const loading$ = this.fetchAllPdfs(folderId).pipe(
      tap(files => {
        this.cacheAllPdfs.set(folderId, files);
        this.cacheLoading.delete(folderId);
        console.log(`Cache de PDFs carregado para pasta ${folderIdentifier}: ${files.length} arquivos`);
      }),
      shareReplay(1)
    );

    this.cacheLoading.set(folderId, loading$);

    return loading$.pipe(
      map(files => files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  // Busca todos os PDFs de uma pasta com paginação
  private fetchAllPdfs(folderId: string, pageToken?: string): Observable<PdfFile[]> {
    return this.fetchPageAllPdfs(folderId).pipe(
      expand(response => {
        if (response.nextPageToken) {
          return this.fetchPageAllPdfs(folderId, response.nextPageToken);
        }
        return EMPTY;
      }),
      reduce((acc, response) => acc.concat(response.files), [] as PdfFile[])
    );
  }

  private fetchPageAllPdfs(folderId: string, pageToken?: string): Observable<{ files: PdfFile[], nextPageToken?: string }> {
    const query = `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`;

    let params = new HttpParams()
      .set('q', query)
      .set('fields', 'nextPageToken, files(id, name, webViewLink)')
      .set('key', this.apiKey)
      .set('pageSize', '1000');

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      timeout(60000),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.warn(`Tentativa ${retryCount} de busca no Google Drive falhou. Tentando novamente...`, error);
          return timer(retryCount * 1000);
        }
      }),
      map(response => {
        const files = response.files ? response.files.map((file: { name: string; webViewLink: string }) => ({
          name: file.name,
          url: file.webViewLink
        })) : [];
        return { files, nextPageToken: response.nextPageToken };
      }),
      catchError(error => {
        console.error('Erro na busca do Google Drive após todas as tentativas:', error);
        return of({ files: [] as PdfFile[], nextPageToken: undefined });
      })
    );
  }

  // Conta o total de PDFs em uma pasta do Google Drive
  contarPdfFiles(folderIdentifier: string): Observable<number> {
    const folderId = this.getFolderId(folderIdentifier);
    if (!folderId) {
      return of(0);
    }

    // Se já temos cache, retorna a contagem do cache
    if (this.cacheAllPdfs.has(folderId)) {
      return of(this.cacheAllPdfs.get(folderId)!.length);
    }

    // Se já está carregando, reutiliza
    if (this.cacheLoading.has(folderId)) {
      return this.cacheLoading.get(folderId)!.pipe(
        map(files => files.length)
      );
    }

    // Carrega todos os PDFs, salva no cache e retorna a contagem
    const loading$ = this.fetchAllPdfs(folderId).pipe(
      tap(files => {
        this.cacheAllPdfs.set(folderId, files);
        this.cacheLoading.delete(folderId);
        console.log(`Cache de PDFs carregado para pasta ${folderIdentifier}: ${files.length} arquivos`);
      }),
      shareReplay(1)
    );

    this.cacheLoading.set(folderId, loading$);

    return loading$.pipe(
      map(files => files.length)
    );
  }

}
