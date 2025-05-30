import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

// Angular Material
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

// RxJS

// Componentes e serviços

// Usando a interface Po do modelo


@Component({
  selector: 'app-po-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './po-lista.component.html',
  styleUrls: ['./po-lista.component.scss']
})

export class PoListaComponent {
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
  isLoading = false;
  dataSource = new MatTableDataSource<any>([]);

  totalItems: number = 0;
  pageSize: number = 10;


  onSortChange(event: Sort): void {
    // Implemente a lógica de ordenação se necessário
    // Por enquanto, apenas evita erro de template
    console.log('Ordenação:', event);
  }

  navegarParaNovoPo(): void {
    // Implemente a navegação para adicionar novo PO
    // Por enquanto, apenas evita erro de template
    console.log('Navegar para novo PO');
  }

  atualizar(po: any): void {
    console.log('Atualizar PO:', po);
    // Implemente aqui a lógica para atualizar o PO
  }

  excluir(po: any): void {
    console.log('Excluir PO:', po);
    // Implemente aqui a lógica para excluir o PO
  }

  onPageChange(event: PageEvent): void {
    console.log('Mudança de página:', event);
    // Implemente aqui a lógica para lidar com a troca de página
  }
}