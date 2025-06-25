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

  allPdfFiles: PdfFile[] = [];
  dataSource = new MatTableDataSource<PdfFile>([]);
  searchTerm = '';
  searchTerm2 = '';
  searchTerm3 = '';
  searchTerm4 = '';
  loading = true;
  errorMessage = '';
  tituloRegional: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Reage quando o valor de 'sheetName' é passado pelo componente pai
    if (changes['sheetName'] && changes['sheetName'].currentValue) {
      this.tituloRegional = this.sheetName.toUpperCase();
      this.loadPdfFiles();
    }
  }

  ngAfterViewInit() {
    // Configura o paginador para a tabela
    this.dataSource.paginator = this.paginator;
  }

  loadPdfFiles(): void {
    this.loading = true;
    this.errorMessage = '';
    this.pdfService.getPdfFiles(this.sheetName).subscribe({
      next: (files) => {
        this.allPdfFiles = files;
        this.limparFiltro('searchTerm'); // Limpa todos os filtros
        this.filterPdfFiles(); // Aplica os filtros (agora vazios) e atualiza a tabela
        this.loading = false;
        this.cdr.detectChanges(); // Garante que a view seja atualizada
      },
      error: (error) => {
        this.errorMessage = `Erro ao carregar os arquivos da regional ${this.sheetName}.`;
        console.error(`Erro ao buscar os PDFs para ${this.sheetName}:`, error);
        this.allPdfFiles = [];
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  limparFiltro(filtro: 'searchTerm' | 'searchTerm2' | 'searchTerm3' | 'searchTerm4'): void {
    // Limpa todos os filtros para uma nova busca
    this.searchTerm = '';
    this.searchTerm2 = '';
    this.searchTerm3 = '';
    this.searchTerm4 = '';
    this.filterPdfFiles();
  }

  filterPdfFiles(): void {
    if (!this.allPdfFiles) {
      this.dataSource.data = [];
      return;
    }
    this.dataSource.data = this.allPdfFiles.filter(file =>
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      file.name.toLowerCase().includes(this.searchTerm2.toLowerCase()) &&
      file.name.toLowerCase().includes(this.searchTerm3.toLowerCase()) &&
      file.name.toLowerCase().includes(this.searchTerm4.toLowerCase())
    );
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navegarParaMenu(): void {
    this.router.navigate(['/menu']);
  }
}