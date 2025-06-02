import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService, PdfFile } from '../../services/pdf.service'; // Ajuste o caminho se o serviço estiver em outro local

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator } from '@angular/material/paginator';

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
export class PdfListComponent implements OnInit, AfterViewInit {
  allPdfFiles: PdfFile[] = [];
  dataSource = new MatTableDataSource<PdfFile>([]);
  searchTerm = '';
  searchTerm2 = '';
  searchTerm3 = '';
  loading = true;
  errorMessage = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService) { }

  ngOnInit(): void {
    this.loading = true;
    this.pdfService.getPdfFiles().subscribe(
      (files) => {
        this.allPdfFiles = files;
        this.searchTerm = '';
        this.searchTerm2 = '';
        this.searchTerm3 = '';
        this.filterPdfFiles();
        // this.dataSource.paginator = this.paginator; // Movido para ngAfterViewInit
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Erro ao carregar os arquivos.';
        console.error('Erro ao buscar os PDFs:', error);
        this.loading = false;
      }
    );
  }

  filterPdfFiles(): void {
    if (!this.allPdfFiles || this.allPdfFiles.length === 0) {
      this.dataSource.data = [];
      return;
    }
    this.dataSource.data = this.allPdfFiles.filter(file =>
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      file.name.toLowerCase().includes(this.searchTerm2.toLowerCase()) &&
      file.name.toLowerCase().includes(this.searchTerm3.toLowerCase())
    );
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    // LOG para depuração:
    console.log('all:', this.allPdfFiles.length, 'filtered:', this.dataSource.data.length, 'term1:', this.searchTerm, 'term2:', this.searchTerm2, 'term3:', this.searchTerm3);
  }

  ngAfterViewInit() {
    if (this.dataSource) { // Garante que dataSource exista
        this.dataSource.paginator = this.paginator;
    }
  }
}


