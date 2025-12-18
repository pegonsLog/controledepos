import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService, PdfFile } from '../../services/pdf.service';

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
export class PdfListComponent implements OnChanges, AfterViewInit {
  @Input() sheetName: string = ''; // Receberá a regional ('Oeste', 'Barreiro') do componente pai

  dataSource = new MatTableDataSource<PdfFile>([]);
  searchTerm = '';
  searchTerm2 = '';
  searchTerm3 = '';
  searchTerm4 = '';
  loading = false;
  errorMessage = '';
  tituloRegional: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheetName'] && changes['sheetName'].currentValue) {
      this.tituloRegional = this.sheetName.toUpperCase();
      // Não carrega mais automaticamente - aguarda busca do usuário
      this.limparFiltro('searchTerm');
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Busca PDFs diretamente no Google Drive
  searchPdfFiles(): void {
    const termoPrincipal = this.searchTerm.trim();
    if (!termoPrincipal) {
      this.dataSource.data = [];
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.pdfService.searchPdfFiles(this.sheetName, termoPrincipal).subscribe({
      next: (files) => {
        // Aplica filtros adicionais localmente (searchTerm2, 3, 4)
        this.dataSource.data = files.filter(file =>
          file.name.toLowerCase().includes(this.searchTerm2.toLowerCase()) &&
          file.name.toLowerCase().includes(this.searchTerm3.toLowerCase()) &&
          file.name.toLowerCase().includes(this.searchTerm4.toLowerCase())
        );
        this.loading = false;
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
      }
    });
  }

  limparFiltro(filtro: 'searchTerm' | 'searchTerm2' | 'searchTerm3' | 'searchTerm4'): void {
    this.searchTerm = '';
    this.searchTerm2 = '';
    this.searchTerm3 = '';
    this.searchTerm4 = '';
    this.dataSource.data = [];
  }

  // Filtra localmente os resultados já carregados (para filtros secundários)
  filterPdfFiles(): void {
    // Se não tem termo principal, faz nova busca
    if (this.searchTerm.trim()) {
      this.searchPdfFiles();
    }
  }

  navegarParaMenu(): void {
    this.router.navigate(['/menu']);
  }

  // Chamado quando clica no botão da lista de POs
  aplicarFiltroAutomatico(filtro: string): void {
    this.searchTerm = '';
    this.searchTerm2 = '';
    this.searchTerm3 = '';
    this.searchTerm4 = '';

    this.searchTerm = filtro;
    this.searchPdfFiles(); // Busca diretamente no Google Drive

    this.cdr.detectChanges();
  }
}
