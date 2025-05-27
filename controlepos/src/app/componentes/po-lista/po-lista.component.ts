import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Po } from '../../modelos/po';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { PoService } from '../../services/po.service';
import { Subject } from 'rxjs';
import { QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';

// Imports para Standalone Component e Angular Material
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-po-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './po-lista.component.html',
  styleUrls: ['./po-lista.component.scss']
})
export class PoListaComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle = 'Lista de POs';
  displayedColumns: string[] = [
    'numero_po',
    'data_po',
    'tipo_de_logradouro',
    'logradouro',
    'complemento',
    'analista',
    'data_implantacao',
    'funcionario_responsavel',
    'bairro',
    'observacoes',
    'detalhamento',
    'especificacoes',
    'e_mail',
    'situacao',
    'solicitante',
    'tipo_de_solicitante',
    'data_enc_dro',
    'link_do_po',
    'numero_de_controle',
    'data_arquivamento',
    'criado_em',
    'ultima_edicao',
    'acoes'
  ];
  dataSource: MatTableDataSource<Po>;
  isLoading = true;
  private destroy$ = new Subject<void>();

  pageSize = 10;
  currentPageData: Po[] = [];
  lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  firstVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  isFirstPage = true;
  isLastPage = false;
  private previousPageLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private poService: PoService, private router: Router) {
    this.dataSource = new MatTableDataSource<Po>([]);
  }

  ngOnInit(): void {
    this.loadPageData('initial');
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadPageData(direction: 'initial' | 'next' | 'prev'): Promise<void> {
    this.isLoading = true;
    let startAfterDoc = null;

    if (direction === 'next') {
      startAfterDoc = this.lastVisibleDoc;
      this.previousPageLastDoc = this.firstVisibleDoc;
    } else if (direction === 'prev') {
      startAfterDoc = this.previousPageLastDoc;
      if (direction === 'prev' && !this.previousPageLastDoc && !this.isFirstPage) {
        startAfterDoc = null;
      } else {
        startAfterDoc = this.previousPageLastDoc;
      }
    }

    try {
      const result = await this.poService.getPosPaginated(this.pageSize, startAfterDoc ? startAfterDoc : undefined);

      if (this.destroy$.isStopped) return;

      this.currentPageData = result.data.map((po: Po) => this.convertPoDates(po));
      this.dataSource.data = this.currentPageData;

      this.firstVisibleDoc = result.data.length > 0 ? result.lastVisibleDoc : null;
      this.lastVisibleDoc = result.lastVisibleDoc;

      if (direction === 'initial') {
        this.isFirstPage = true;
        this.previousPageLastDoc = null;
      } else if (direction === 'next') {
        this.isFirstPage = false;
      } else if (direction === 'prev') {
        if (!startAfterDoc) {
          this.isFirstPage = true;
          this.previousPageLastDoc = null;
        } else {
          this.isFirstPage = false;
        }
      }

      this.isLastPage = result.data.length < this.pageSize || !result.lastVisibleDoc;
      if (direction === 'prev' && result.data.length === this.pageSize) {
        this.isLastPage = false;
      }
      if (result.data.length === 0 && direction === 'next') {
        this.isLastPage = true;
        this.lastVisibleDoc = startAfterDoc;
      }

    } catch (err: any) {
      if (this.destroy$.isStopped) return;
      console.error('Erro ao carregar POs paginados:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private convertPoDates(po: Po): Po {
    const poCopy = { ...po };
    const dateFields: (keyof Po)[] = [
      'data_po',
      'data_implantacao',
      'data_enc_dro',
      'data_arquivamento',
      'criado_em',
      'ultima_edicao'
    ];

    for (const field of dateFields) {
      const value = poCopy[field];
      if (typeof value === 'string' && value) {
        let date = this.parseYYYYMMDD(value);
        if (!date || isNaN(date.getTime())) {
          date = this.parseDDMMYYYY(value);
        }
        (poCopy[field] as any) = (date && !isNaN(date.getTime())) ? date : null;
      } else if (value !== null && typeof value === 'object') {
        if ((value as any) instanceof Date && !isNaN((value as Date).getTime())) {
          (poCopy[field] as any) = value;
        } else {
          (poCopy[field] as any) = null;
        }
      } else {
        (poCopy[field] as any) = null;
      }
    }
    return poCopy;
  }

  private parseYYYYMMDD(dateString: string): Date | null {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(Date.UTC(year, month, day));
        if (d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day) {
          return d;
        }
      }
    }
    return null;
  }

  private parseDDMMYYYY(dateString: string): Date | null {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d = new Date(Date.UTC(year, month, day));
        if (d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day) {
          return d;
        }
      }
    }
    return null;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navegarParaNovoPo(): void {
    this.router.navigate(['/novo-po']);
  }

  editarPo(numeroPo: string): void {
    this.router.navigate(['/editar-po', numeroPo]);
  }

  detalhesPo(numeroPo: string): void {
    this.router.navigate(['/po/detalhes', numeroPo]);
  }

  async excluirPo(numeroPo: string): Promise<void> {
    if (confirm(`Tem certeza que deseja excluir o PO ${numeroPo}? Esta ação não pode ser desfeita.`)) {
      this.isLoading = true;
      try {
        await this.poService.deletePo(numeroPo);
        this.dataSource.data = this.dataSource.data.filter(po => po.numero_po !== numeroPo);
        alert(`PO ${numeroPo} excluído com sucesso.`);
      } catch (error) {
        console.error(`Erro ao excluir PO ${numeroPo}:`, error);
        alert(`Erro ao excluir PO ${numeroPo}. Verifique o console.`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.loadPageData('next');
    }
  }

  previousPage(): void {
    if (!this.isFirstPage) {
      this.loadPageData('prev');
    }
  }
}
