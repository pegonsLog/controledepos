import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    // RouterOutlet, RouterLink // Se for usar routerLink no template, adicione RouterLink aqui e importe de @angular/router
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
  searchTerm4 = '';
  loading = true;
  errorMessage = '';
  tituloRegional: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      const folderIdentifier = params.get('folderIdentifier');
      if (folderIdentifier) {
        this.tituloRegional = folderIdentifier.toUpperCase();
        this.pdfService.getPdfFiles(folderIdentifier).subscribe(
          (files) => {
            this.allPdfFiles = files;
            this.searchTerm = '';
            this.searchTerm2 = '';
            this.searchTerm3 = '';
            this.searchTerm4 = '';
            this.filterPdfFiles();
            if (this.paginator) { // Ensure paginator is available before assigning
              this.dataSource.paginator = this.paginator;
            }
            this.loading = false;
          },
          (error: any) => { // Correctly placed error handler for getPdfFiles
            this.errorMessage = `Erro ao carregar os arquivos da pasta ${folderIdentifier}.`;
            console.error(`Erro ao buscar os PDFs para ${folderIdentifier}:`, error);
            this.loading = false;
          }
        );
      } else {
        this.errorMessage = 'Identificador da pasta não encontrado na rota.';
        console.error('Identificador da pasta não encontrado na rota.');
        this.loading = false;
      }
    });
  }

  filterPdfFiles(): void {
    if (!this.allPdfFiles || this.allPdfFiles.length === 0) {
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
    this.router.navigate(['/menu']); // Ajuste a rota conforme necessário
  }

  ngAfterViewInit() {
    if (this.dataSource) { // Garante que dataSource exista
        this.dataSource.paginator = this.paginator;
    }
  }
}


