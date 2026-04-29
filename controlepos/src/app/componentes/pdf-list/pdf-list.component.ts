import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService, PdfFile } from '../../services/pdf.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-pdf-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './pdf-list.component.html',
  styleUrls: ['./pdf-list.component.scss']
})
export class PdfListComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() sheetName: string = ''; // Receberá a regional ('Oeste', 'Barreiro') do componente pai

  dataSource = new MatTableDataSource<PdfFile>([]);
  searchTerm = '';
  searchTerm2 = '';
  searchTerm3 = '';
  searchTerm4 = '';
  loading = false;
  loadingCount = false;
  errorMessage = '';
  tituloRegional: string = '';
  totalPdfs: number = 0;

  // Debounce e cancelamento de buscas
  private searchSubject = new Subject<void>();
  private currentSearchSubscription: Subscription | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService, private cdr: ChangeDetectorRef, private router: Router) {
    // Configura debounce de 600ms para a digitação
    this.searchSubject.pipe(
      debounceTime(600)
    ).subscribe(() => {
      this.executarBusca();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheetName'] && changes['sheetName'].currentValue) {
      this.tituloRegional = this.sheetName.toUpperCase();
      // Não carrega mais automaticamente - aguarda busca do usuário
      this.limparFiltro('searchTerm');
      // Conta o total de PDFs na pasta
      this.carregarTotalPdfs();
    }
  }

  carregarTotalPdfs(): void {
    this.loadingCount = true;
    this.pdfService.contarPdfFiles(this.sheetName).subscribe({
      next: (total) => {
        this.totalPdfs = total;
        this.loadingCount = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.totalPdfs = 0;
        this.loadingCount = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    if (this.currentSearchSubscription) {
      this.currentSearchSubscription.unsubscribe();
    }
  }

  // Busca PDFs diretamente no Google Drive
  searchPdfFiles(): void {
    const termoPrincipal = this.searchTerm.trim();
    if (!termoPrincipal) {
      this.dataSource.data = [];
      return;
    }

    // Cancela busca anterior se ainda estiver em andamento
    if (this.currentSearchSubscription) {
      this.currentSearchSubscription.unsubscribe();
      this.currentSearchSubscription = null;
    }

    this.loading = true;
    this.errorMessage = '';

    this.currentSearchSubscription = this.pdfService.searchPdfFiles(this.sheetName, termoPrincipal).subscribe({
      next: (files) => {
        // Aplica filtros adicionais localmente (searchTerm2, 3, 4)
        this.dataSource.data = files.filter(file =>
          file.name.toLowerCase().includes(this.searchTerm2.toLowerCase()) &&
          file.name.toLowerCase().includes(this.searchTerm3.toLowerCase()) &&
          file.name.toLowerCase().includes(this.searchTerm4.toLowerCase())
        );
        this.loading = false;
        this.currentSearchSubscription = null;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = `Erro ao buscar arquivos.`;
        console.error(`Erro ao buscar PDFs:`, error);
        this.dataSource.data = [];
        this.loading = false;
        this.currentSearchSubscription = null;
      }
    });
  }

  // Executa a busca após o debounce
  private executarBusca(): void {
    if (this.searchTerm.trim()) {
      this.searchPdfFiles();
    } else {
      this.dataSource.data = [];
    }
  }

  limparFiltro(filtro: 'searchTerm' | 'searchTerm2' | 'searchTerm3' | 'searchTerm4'): void {
    // Cancela busca em andamento
    if (this.currentSearchSubscription) {
      this.currentSearchSubscription.unsubscribe();
      this.currentSearchSubscription = null;
    }
    this.searchTerm = '';
    this.searchTerm2 = '';
    this.searchTerm3 = '';
    this.searchTerm4 = '';
    this.dataSource.data = [];
    this.loading = false;
  }

  // Chamado pelo template a cada keyup - dispara o debounce
  filterPdfFiles(): void {
    this.searchSubject.next();
  }

  navegarParaMenu(): void {
    this.router.navigate(['/menu']);
  }

  // Chamado quando clica no botão da lista de POs - busca imediata sem debounce
  aplicarFiltroAutomatico(filtro: string): void {
    // Cancela busca anterior
    if (this.currentSearchSubscription) {
      this.currentSearchSubscription.unsubscribe();
      this.currentSearchSubscription = null;
    }

    this.searchTerm = '';
    this.searchTerm2 = '';
    this.searchTerm3 = '';
    this.searchTerm4 = '';

    this.searchTerm = filtro;
    this.searchPdfFiles(); // Busca diretamente no Google Drive (sem debounce)

    this.cdr.detectChanges();
  }
}
