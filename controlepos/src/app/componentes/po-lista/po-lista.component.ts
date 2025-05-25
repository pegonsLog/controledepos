import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Adicionado DatePipe
import { Router } from '@angular/router'; // Adicionado Router
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Adicionado MatButtonModule
import { Po } from '../../modelos/po';

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
    MatIconModule,
    MatButtonModule, // Adicionado MatButtonModule
    // DatePipe não é um módulo para imports array, mas um pipe que pode ser usado no template se CommonModule estiver presente
  ],
  providers: [DatePipe], // DatePipe precisa ser fornecido se injetado no construtor
  templateUrl: './po-lista.component.html',
  styleUrls: ['./po-lista.component.scss']
})
export class PoListaComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'numero_do_po',
    'data_po',
    'situacao',
    'analista',
    'solicitante',
    'tipo_de_solicitante',
    'bairro',
    'tipo_de_logradouro',
    'logradouro',
    'complemento_do_logradouro',
    'data_implantacao',
    'funcionario_responsavel',
    'observacoes',
    'especificacoes',
    'e_mail',
    'data_enc_dro',
    'link_do_po',
    'numero_de_controle',
    'data_arquivamento',
    'criado_em',
    'ultima_edicao',
    'acoes' // Coluna de ações permanece no final
  ];
  dataSource: MatTableDataSource<Po>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Dados mockados para demonstração
  MOCK_DATA: Po[] = [
    { numero_do_po: 'PO-001', data_po: new Date(2024, 0, 15), analista: 'João Silva', situacao: 'Em Andamento', solicitante: 'Empresa A', bairro: 'Centro', tipo_de_logradouro: 'Rua', logradouro: 'Principal', complemento_do_logradouro: 'Sala 101', data_implantacao: new Date(2024, 0, 20), funcionario_responsavel: 'Carlos P.', observacoes: 'Urgente', especificacoes: 'Padrão', e_mail: 'joao@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 1, 1), link_do_po: 'http://link.com/po001', numero_de_controle: 'CTRL001', data_arquivamento: new Date(2024, 1, 5), criado_em: new Date(), ultima_edicao: new Date() },
    { numero_do_po: 'PO-002', data_po: new Date(2024, 1, 20), analista: 'Maria Oliveira', situacao: 'Concluído', solicitante: 'Empresa B', bairro: 'Vila Nova', tipo_de_logradouro: 'Avenida', logradouro: 'Central', complemento_do_logradouro: 'Andar 5', data_implantacao: new Date(2024, 1, 25), funcionario_responsavel: 'Ana R.', observacoes: 'Revisado', especificacoes: 'Customizado', e_mail: 'maria@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 2, 10), link_do_po: 'http://link.com/po002', numero_de_controle: 'CTRL002', data_arquivamento: new Date(2024, 2, 15), criado_em: new Date(), ultima_edicao: new Date() },
    { numero_do_po: 'PO-003', data_po: new Date(2023, 11, 10), analista: 'Pedro Costa', situacao: 'Pendente', solicitante: 'Empresa C', bairro: 'Jardins', tipo_de_logradouro: 'Praça', logradouro: 'Circular', complemento_do_logradouro: 'Loja 3', data_implantacao: new Date(2023, 11, 15), funcionario_responsavel: 'Sofia L.', observacoes: '', especificacoes: 'Básico', e_mail: 'pedro@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 0, 5), link_do_po: 'http://link.com/po003', numero_de_controle: 'CTRL003', data_arquivamento: new Date(2024, 0, 10), criado_em: new Date(), ultima_edicao: new Date() }
  ];

  constructor(private router: Router, private datePipe: DatePipe) { // Injetado Router e DatePipe
    this.dataSource = new MatTableDataSource(this.MOCK_DATA);
  }

  ngOnInit(): void {
    // Se você fosse buscar dados de um serviço:
    // this.poService.getPos().subscribe(data => {
    //   this.dataSource.data = data;
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.paginator) {
      this.paginator.pageSize = 10; // Define o número de registros por página
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get totalRegistros(): number {
    // Se estiver usando filtro, dataSource.filteredData.length é mais preciso
    return this.dataSource.filteredData.length;
  }

  // Função para navegar para o formulário de edição (exemplo)
  editarPo(po: Po): void {
    // Você precisará de uma rota para edição, por exemplo: '/editar-po/:id'
    // this.router.navigate(['/editar-po', po.numero_do_po]); // ou qualquer ID único
    console.log('Editar PO:', po);
    alert('Funcionalidade de edição a ser implementada. Veja o console.');
  }

  // Função para visualizar detalhes (exemplo)
  visualizarPo(po: Po): void {
    // Você precisará de uma rota para visualização, por exemplo: '/ver-po/:id'
    // this.router.navigate(['/ver-po', po.numero_do_po]);
    console.log('Visualizar PO:', po);
    alert('Funcionalidade de visualização a ser implementada. Veja o console.');
  }
}
