import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Po } from '../../modelos/po';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

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
import { RouterModule } from '@angular/router'; // Adicionar esta linha

// MOCK DATA - Em uma aplicação real, isso viria de um serviço
const MOCK_POS_DATA: Po[] = [
  { numero_do_po: 'PO-001', data_po: new Date(2024, 0, 15), analista: 'João Silva', situacao: 'Em Andamento', solicitante: 'Empresa A', bairro: 'Centro', tipo_de_logradouro: 'Rua', logradouro: 'Principal', complemento_do_logradouro: 'Sala 101', data_implantacao: new Date(2024, 0, 20), funcionario_responsavel: 'Carlos P.', observacoes: 'Urgente', especificacoes: 'Padrão', e_mail: 'joao@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 1, 1), link_do_po: 'http://link.com/po001', numero_de_controle: 'CTRL001', data_arquivamento: new Date(2024, 1, 5), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-002', data_po: new Date(2024, 1, 20), analista: 'Maria Oliveira', situacao: 'Concluído', solicitante: 'Empresa B', bairro: 'Vila Nova', tipo_de_logradouro: 'Avenida', logradouro: 'Central', complemento_do_logradouro: 'Andar 5', data_implantacao: new Date(2024, 1, 25), funcionario_responsavel: 'Ana R.', observacoes: 'Revisado', especificacoes: 'Customizado', e_mail: 'maria@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 2, 10), link_do_po: 'http://link.com/po002', numero_de_controle: 'CTRL002', data_arquivamento: new Date(2024, 2, 15), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-003', data_po: new Date(2023, 11, 10), analista: 'Pedro Costa', situacao: 'Pendente', solicitante: 'Empresa C', bairro: 'Jardins', tipo_de_logradouro: 'Praça', logradouro: 'Circular', complemento_do_logradouro: 'Loja 3', data_implantacao: new Date(2023, 11, 15), funcionario_responsavel: 'Sofia L.', observacoes: '', especificacoes: 'Básico', e_mail: 'pedro@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 0, 5), link_do_po: 'http://link.com/po003', numero_de_controle: 'CTRL003', data_arquivamento: new Date(2024, 0, 10), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-004', data_po: new Date(2024, 2, 1), analista: 'Ana Beatriz', situacao: 'Em Andamento', solicitante: 'Empresa D', bairro: 'Lapa', tipo_de_logradouro: 'Rua', logradouro: 'das Palmeiras', complemento_do_logradouro: 'Apto 22', data_implantacao: new Date(2024, 2, 5), funcionario_responsavel: 'Marcos G.', observacoes: 'Verificar documentação', especificacoes: 'Premium', e_mail: 'ana.b@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 3, 10), link_do_po: 'http://link.com/po004', numero_de_controle: 'CTRL004', data_arquivamento: new Date(2024, 3, 15), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-005', data_po: new Date(2024, 2, 10), analista: 'Lucas Mendes', situacao: 'Concluído', solicitante: 'Empresa E', bairro: 'Barra Funda', tipo_de_logradouro: 'Avenida', logradouro: 'Industrial', complemento_do_logradouro: 'Galpão 5', data_implantacao: new Date(2024, 2, 15), funcionario_responsavel: 'Julia P.', observacoes: 'Tudo OK', especificacoes: 'Padrão', e_mail: 'lucas.m@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 3, 20), link_do_po: 'http://link.com/po005', numero_de_controle: 'CTRL005', data_arquivamento: new Date(2024, 3, 25), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-006', data_po: new Date(2024, 3, 5), analista: 'Fernanda Lima', situacao: 'Pendente', solicitante: 'Cliente X', bairro: 'Moema', tipo_de_logradouro: 'Alameda', logradouro: 'dos Pássaros', complemento_do_logradouro: 'Casa 10', data_implantacao: new Date(2024, 3, 10), funcionario_responsavel: 'Ricardo S.', observacoes: 'Aguardando pagamento', especificacoes: 'Customizado', e_mail: 'fernanda.l@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 4, 12), link_do_po: 'http://link.com/po006', numero_de_controle: 'CTRL006', data_arquivamento: new Date(2024, 4, 18), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-007', data_po: new Date(2024, 3, 15), analista: 'Gabriel Alves', situacao: 'Cancelado', solicitante: 'Empresa F', bairro: 'Pinheiros', tipo_de_logradouro: 'Travessa', logradouro: 'Curta', complemento_do_logradouro: '', data_implantacao: new Date(2024, 3, 20), funcionario_responsavel: 'Beatriz M.', observacoes: 'Cliente desistiu', especificacoes: 'Básico', e_mail: 'gabriel.a@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 4, 22), link_do_po: 'http://link.com/po007', numero_de_controle: 'CTRL007', data_arquivamento: new Date(2024, 4, 28), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-008', data_po: new Date(2024, 4, 2), analista: 'Mariana Costa', situacao: 'Em Andamento', solicitante: 'Governo Estadual', bairro: 'Centro Cívico', tipo_de_logradouro: 'Praça', logradouro: 'da República', complemento_do_logradouro: 'Edifício Governamental, Sala 301', data_implantacao: new Date(2024, 4, 8), funcionario_responsavel: 'Tiago N.', observacoes: 'Prioridade alta', especificacoes: 'Premium', e_mail: 'mariana.c@gov.br', tipo_de_solicitante: 'Governo', data_enc_dro: new Date(2024, 5, 15), link_do_po: 'http://link.com/po008', numero_de_controle: 'CTRL008', data_arquivamento: new Date(2024, 5, 20), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-009', data_po: new Date(2024, 4, 12), analista: 'Rafael Souza', situacao: 'Aguardando Aprovação', solicitante: 'Cliente Y', bairro: 'Itaim Bibi', tipo_de_logradouro: 'Rua', logradouro: 'Comercial', complemento_do_logradouro: 'Conjunto 45', data_implantacao: new Date(2024, 4, 18), funcionario_responsavel: 'Larissa F.', observacoes: 'Aguardando documentação do cliente', especificacoes: 'Padrão', e_mail: 'rafael.s@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 5, 25), link_do_po: 'http://link.com/po009', numero_de_controle: 'CTRL009', data_arquivamento: new Date(2024, 5, 30), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-010', data_po: new Date(2024, 5, 1), analista: 'Camila Santos', situacao: 'Concluído', solicitante: 'Empresa G', bairro: 'Santana', tipo_de_logradouro: 'Avenida', logradouro: 'Norte', complemento_do_logradouro: 'Bloco A, Apto 1001', data_implantacao: new Date(2024, 5, 7), funcionario_responsavel: 'Diego R.', observacoes: 'Entrega finalizada', especificacoes: 'Customizado', e_mail: 'camila.s@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 6, 10), link_do_po: 'http://link.com/po010', numero_de_controle: 'CTRL010', data_arquivamento: new Date(2024, 6, 15), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-011', data_po: new Date(2024, 5, 10), analista: 'Bruno Oliveira', situacao: 'Em Andamento', solicitante: 'Cliente Z', bairro: 'Perdizes', tipo_de_logradouro: 'Rua', logradouro: 'Residencial', complemento_do_logradouro: 'Casa 5, Fundos', data_implantacao: new Date(2024, 5, 15), funcionario_responsavel: 'Vanessa P.', observacoes: 'Ajustes solicitados', especificacoes: 'Básico', e_mail: 'bruno.o@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 6, 20), link_do_po: 'http://link.com/po011', numero_de_controle: 'CTRL011', data_arquivamento: new Date(2024, 6, 25), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-012', data_po: new Date(2024, 6, 3), analista: 'Juliana Pereira', situacao: 'Pendente', solicitante: 'Empresa H', bairro: 'Tatuapé', tipo_de_logradouro: 'Praça', logradouro: 'Central', complemento_do_logradouro: 'Quiosque 2', data_implantacao: new Date(2024, 6, 9), funcionario_responsavel: 'Gustavo L.', observacoes: 'Falta definir escopo', especificacoes: 'Premium', e_mail: 'juliana.p@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 7, 18), link_do_po: 'http://link.com/po012', numero_de_controle: 'CTRL012', data_arquivamento: new Date(2024, 7, 22), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-013', data_po: new Date(2024, 6, 12), analista: 'Rodrigo Martins', situacao: 'Em Andamento', solicitante: 'Cliente W', bairro: 'Vila Madalena', tipo_de_logradouro: 'Rua', logradouro: 'Boêmia', complemento_do_logradouro: 'Sobreloja', data_implantacao: new Date(2024, 6, 18), funcionario_responsavel: 'Amanda C.', observacoes: '', especificacoes: 'Padrão', e_mail: 'rodrigo.m@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 7, 28), link_do_po: 'http://link.com/po013', numero_de_controle: 'CTRL013', data_arquivamento: new Date(2024, 8, 2), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-014', data_po: new Date(2024, 7, 5), analista: 'Beatriz Almeida', situacao: 'Concluído', solicitante: 'Empresa I', bairro: 'Morumbi', tipo_de_logradouro: 'Avenida', logradouro: 'das Mansões', complemento_do_logradouro: 'Portaria Principal', data_implantacao: new Date(2024, 7, 10), funcionario_responsavel: 'Felipe N.', observacoes: 'Cliente satisfeito', especificacoes: 'Customizado', e_mail: 'beatriz.a@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 8, 15), link_do_po: 'http://link.com/po014', numero_de_controle: 'CTRL014', data_arquivamento: new Date(2024, 8, 20), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-015', data_po: new Date(2024, 7, 15), analista: 'Vinicius Barros', situacao: 'Aguardando Aprovação', solicitante: 'Cliente V', bairro: 'Campo Belo', tipo_de_logradouro: 'Alameda', logradouro: 'Florida', complemento_do_logradouro: 'Torre B, Apto 505', data_implantacao: new Date(2024, 7, 20), funcionario_responsavel: 'Renata G.', observacoes: 'Proposta enviada', especificacoes: 'Básico', e_mail: 'vinicius.b@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 8, 25), link_do_po: 'http://link.com/po015', numero_de_controle: 'CTRL015', data_arquivamento: new Date(2024, 8, 30), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-016', data_po: new Date(2024, 8, 2), analista: 'Larissa Ferreira', situacao: 'Em Andamento', solicitante: 'Empresa J', bairro: 'Liberdade', tipo_de_logradouro: 'Rua', logradouro: 'Oriental', complemento_do_logradouro: 'Loja 15', data_implantacao: new Date(2024, 8, 8), funcionario_responsavel: 'Eduardo K.', observacoes: 'Reunião agendada', especificacoes: 'Premium', e_mail: 'larissa.f@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 9, 12), link_do_po: 'http://link.com/po016', numero_de_controle: 'CTRL016', data_arquivamento: new Date(2024, 9, 18), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-017', data_po: new Date(2024, 8, 11), analista: 'Daniel Rocha', situacao: 'Pendente', solicitante: 'Cliente U', bairro: 'Consolação', tipo_de_logradouro: 'Travessa', logradouro: 'Estreita', complemento_do_logradouro: 'Portão 2', data_implantacao: new Date(2024, 8, 17), funcionario_responsavel: 'Patricia O.', observacoes: 'Aguardando informações técnicas', especificacoes: 'Padrão', e_mail: 'daniel.r@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 9, 20), link_do_po: 'http://link.com/po017', numero_de_controle: 'CTRL017', data_arquivamento: new Date(2024, 9, 25), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-018', data_po: new Date(2024, 9, 1), analista: 'Sofia Castro', situacao: 'Concluído', solicitante: 'Empresa K', bairro: 'Aclimação', tipo_de_logradouro: 'Rua', logradouro: 'Tranquila', complemento_do_logradouro: 'Casa Amarela', data_implantacao: new Date(2024, 9, 6), funcionario_responsavel: 'Roberto M.', observacoes: 'Finalizado com sucesso', especificacoes: 'Customizado', e_mail: 'sofia.c@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 10, 10), link_do_po: 'http://link.com/po018', numero_de_controle: 'CTRL018', data_arquivamento: new Date(2024, 10, 15), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-019', data_po: new Date(2024, 9, 9), analista: 'Thiago Almeida', situacao: 'Em Andamento', solicitante: 'Cliente T', bairro: 'Bela Vista', tipo_de_logradouro: 'Avenida', logradouro: 'Paulista', complemento_do_logradouro: 'Andar 12, Sala 1205', data_implantacao: new Date(2024, 9, 14), funcionario_responsavel: 'Carolina V.', observacoes: 'Fase de testes', especificacoes: 'Básico', e_mail: 'thiago.a@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 10, 20), link_do_po: 'http://link.com/po019', numero_de_controle: 'CTRL019', data_arquivamento: new Date(2024, 10, 25), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-020', data_po: new Date(2024, 10, 3), analista: 'Alice Ribeiro', situacao: 'Pendente', solicitante: 'Empresa L', bairro: 'Cambuci', tipo_de_logradouro: 'Praça', logradouro: 'Histórica', complemento_do_logradouro: 'Banca Central', data_implantacao: new Date(2024, 10, 8), funcionario_responsavel: 'Marcelo P.', observacoes: 'Aguardando liberação de verba', especificacoes: 'Premium', e_mail: 'alice.r@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 11, 12), link_do_po: 'http://link.com/po020', numero_de_controle: 'CTRL020', data_arquivamento: new Date(2024, 11, 18), criado_em: new Date(), ultima_edicao: new Date() }
];

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
    RouterModule // Adicionar RouterModule aqui
  ],
  templateUrl: './po-lista.component.html',
  styleUrls: ['./po-lista.component.scss']
})
export class PoListaComponent implements OnInit, AfterViewInit {
  pageTitle = 'Lista de POs'; // Título da página
  displayedColumns: string[] = [
    'numero_do_po',
    'data_po',
    'tipo_de_logradouro',
    'logradouro',
    'complemento_do_logradouro',
    'analista',
    'data_implantacao',
    'funcionario_responsavel',
    'bairro',
    'observacoes',
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
    'acoes' // Coluna de ações sempre por último
  ];
  dataSource: MatTableDataSource<Po>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router) { 
    // Inicializa o dataSource, os dados serão carregados em ngOnInit
    this.dataSource = new MatTableDataSource<Po>();
  }

  ngOnInit(): void {
    // Carrega os dados mocados no dataSource
    this.dataSource.data = MOCK_POS_DATA;
  }

  ngAfterViewInit() {
    // É crucial que o paginator e o sort sejam atribuídos DEPOIS que 
    // o ViewChild os resolveu e, idealmente, após os dados estarem no dataSource.
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    } else {
      console.error('ERRO: MatPaginator não foi encontrado em ngAfterViewInit. Verifique o template.');
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      console.error('ERRO: MatSort não foi encontrado em ngAfterViewInit. Verifique o template.');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navegarParaNovoPo(): void {
    this.router.navigate(['/novo-po']);
  }

  editarPo(po: Po): void {
    this.router.navigate(['/po/editar', po.numero_do_po]);
  }

  visualizarDetalhes(po: Po): void {
    console.log('Visualizar detalhes do PO:', po);
    // Exemplo: this.router.navigate(['/po/detalhes', po.numero_do_po]);
  }
}
