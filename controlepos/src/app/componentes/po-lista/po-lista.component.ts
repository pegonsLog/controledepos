import { Component, ViewChild, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoService } from '../../services/po.service';
import { Po } from '../../modelos/po';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';

// Interface Planilha e array planilhas não são mais necessários com a abordagem de rota
// interface Planilha {
//   dados: any[]; 
// }   

import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-po-lista',
  templateUrl: './po-lista.component.html',
  styleUrls: ['./po-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatTooltipModule
  ]
})
export class PoListaComponent implements OnInit, AfterViewInit {
  isLoading: boolean = false;
  selectedRow: Po | null = null; // Para rastrear a linha selecionada
  pos: Po[] = [];
  @Output() selecionarPo = new EventEmitter<string>();

  visualizarPo(po: Po) {
    // Navegar para a rota de visualização, usando o numero_po como identificador
    // Certifique-se de que a rota '/pos/visualizar/:id' esteja configurada no seu roteamento
    if (!this.currentSheetName) {
      console.error('SheetName não definido ao tentar visualizar PO. Não é possível navegar.');
      // Adicionar algum feedback ao usuário, se apropriado
      return;
    }
    this.router.navigate(['/po/detalhes', this.currentSheetName, po.numero_po]);
    // Ou, se você tiver um campo 'id' único:
    // this.router.navigate(['/pos/visualizar', po.id]);
  }

  alterarPo(po: Po) {
    // Navegar para a rota de edição, usando o numero_po como identificador
    // Certifique-se de que a rota '/pos/editar/:id' esteja configurada no seu roteamento
    this.router.navigate(['/po/editar', po.numero_po]); 
    // Ou, se você tiver um campo 'id' único:
    // this.router.navigate(['/pos/editar', po.id]);
  }

  deletarPo(po: Po) {
    // Adicionar uma confirmação antes de excluir
    if (confirm(`Tem certeza que deseja excluir o PO: ${po.numero_po}?`)) {
      // Supondo que PoService.excluir retorne um Observable
      // TODO: Verificar/implementar PoService.excluir se ainda não existir
      if (!this.currentSheetName) {
        console.error("Nome da aba atual não definido para exclusão.");
        // Adicionar feedback de erro para o usuário
        return;
      }
      this.poService.excluir(po.numero_po, this.currentSheetName).subscribe({
        next: () => {
          // Atualizar a lista após a exclusão
          this.pos = this.pos.filter(p => p.numero_po !== po.numero_po);
          this.dataSource.data = this.pos; // Atualiza o dataSource
          this.totalItems = this.pos.length;
          // Adicionar feedback para o usuário (ex: snackbar)
          console.log('PO excluído com sucesso:', po.numero_po);
          // Se estiver usando paginação e filtros do lado do servidor, pode ser necessário recarregar os dados
          // this.aplicarFiltro(); 
        },
        error: (err: unknown) => {
          console.error('Erro ao excluir PO:', err);
          // Adicionar feedback de erro para o usuário
        }
      });
    }
  }

  onSortChange(event: any): void {
    // Implemente aqui a lógica de ordenação conforme necessário
  }

  navegarParaMenu() {
    this.router.navigate(['/menu']);
  }

  private _actualPaginator!: MatPaginator;

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    this._actualPaginator = paginator;
    if (this.dataSource) { // dataSource é inicializado como propriedade da classe
      this.dataSource.paginator = this._actualPaginator;
    } else {
      // Este caso não deve ocorrer se dataSource é inicializado na declaração da propriedade
    }
  }

  totalItems: number = 0;
  pageSize: number = 5;

  displayedColumns = [
    'numero_po',
    'data_po',
    'tipo_logradouro',
    'logradouro',
    'complemento',
    'analista',
    'data_implantacao',
    'funcionario_responsavel',
    'bairro',
    'observacoes',
    'detalhamento',
    'especificacoes',
    'situacao',
    'solicitante',
    'tipo_solicitante',
    'data_enc_dro',
    'numero_controle',
    'data_arquivamento',
    'acoes' // Adicionar coluna de ações
  ];

  dataSource = new MatTableDataSource<any>([]);
  filtro: string = '';
  filtro2: string = '';
  filtro3: string = '';
  filtro4: string = '';
  // planilhaAtual e planilhas não são mais necessários com a abordagem de rota
  // planilhaAtual: number = 1;
  // planilhas: Planilha[] = [
  //   { nome: 'Oeste', dados: [] },
  //   { nome: 'Barreiro', dados: [] }
  // ];
  currentSheetName: string = ''; // Para armazenar o nome da aba atual
  idDaPlanilha = '1AQjzxBPFKxwfAGolCxvzOEcQBs5Z-0yKUKIxsjDXdAI';

  constructor(
    private poService: PoService, 
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute // Injete ActivatedRoute
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(params => {
      const sheetNameParam = params.get('sheetName');
      if (sheetNameParam) {
        this.currentSheetName = sheetNameParam;
        // Se desejar um nome padrão caso nenhum seja fornecido (embora a rota agora exija)
        // this.currentSheetName = sheetNameParam || 'Oeste'; 
        this.loadDataForSheet();
      } else {
        // Tratar caso onde sheetName não está presente, talvez redirecionar ou carregar um padrão
        console.error('SheetName não encontrado nos parâmetros da rota!');
        this.currentSheetName = 'Oeste'; // Fallback para Oeste ou outra lógica
        this.loadDataForSheet(); // Ou mostrar uma mensagem de erro
        // this.router.navigate(['/menu']); // Exemplo de redirecionamento
      }
    });
  }

  loadDataForSheet() {
    if (!this.currentSheetName) return;
    this.isLoading = true;
    this.poService.listar(this.currentSheetName, this.filtro).subscribe(pos => {
      this.pos = pos;
      this.dataSource.data = pos;
      this.totalItems = pos.length;
      this.isLoading = false;
    }, _ => {
      this.isLoading = false;
      // Adicionar tratamento de erro mais robusto aqui
      console.error(`Erro ao carregar dados para a aba: ${this.currentSheetName}`);
    });
  }

  ngAfterViewInit() {
    // O setter do paginator deve cuidar da atribuição.
    // Se for necessário um fallback, pode ser adicionado aqui, mas idealmente o setter é suficiente.
    if (this._actualPaginator && !this.dataSource.paginator) {
       this.dataSource.paginator = this._actualPaginator;
    }
  }

  // O método alternarPlanilha não é mais necessário, a navegação via rota cuidará disso.
  // Se precisar recarregar dados ou mudar filtros com base em botões na mesma página,
  // esses botões deverão usar routerLink para navegar para a rota da outra aba.
  // Ex: [routerLink]="['/lista-pos', 'Barreiro']" e [routerLink]="['/lista-pos', 'Oeste']"
  /*
  alternarPlanilha(sheetName: string) {
    this.router.navigate(['/lista-pos', sheetName]);
  }
  */

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    // A lógica de paginação é gerenciada automaticamente pelo MatTableDataSource
    // quando seu paginator está corretamente vinculado.
    // Se precisar de lógica adicional ao mudar de página (ex: buscar dados do servidor para a nova página),
    // ela seria implementada aqui.
  }

  aplicarFiltro() {
    // Ao aplicar filtro, usamos o currentSheetName já definido
    this.buscarNaGoogleSheets(this.filtro);
  }

  buscarNaGoogleSheets(filtroPrincipal: string) {
    if (!this.currentSheetName) {
      console.error("Nome da aba atual não definido para busca.");
      return;
    }
    this.isLoading = true;
    this.poService.listar(this.currentSheetName, filtroPrincipal).subscribe(
      pos => {
        let dadosFiltrados = pos;

        // Aplicar filtros adicionais sequencialmente
        if (this.filtro2) {
          dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro2));
        }
        if (this.filtro3) {
          dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro3));
        }
        if (this.filtro4) {
          dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro4));
        }

        this.dataSource.data = dadosFiltrados;
        this.totalItems = dadosFiltrados.length;
        this.isLoading = false;
      },
      _ => {
        this.isLoading = false;
      }
    );
  }

  // Método auxiliar para verificar se algum campo do item contém o termo
  itemContemTermo(item: any, termo: string): boolean {
    if (!termo) return true; // Se o termo do filtro adicional for vazio, não filtra
    const termoLower = termo.toLowerCase();
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key) && item[key] != null) { // Checa se item[key] não é null ou undefined
        if (String(item[key]).toLowerCase().includes(termoLower)) {
          return true;
        }
      }
    }
    return false;
  }

  // Método para verificar se uma linha está selecionada
  isSelected(row: any): boolean {
    return this.selectedRow === row;
  }

  // Método para selecionar uma linha
  selecionarLinha(row: Po): void {
    this.selectedRow = this.selectedRow === row ? null : row;
    if (this.selectedRow) {
      this.selecionarPo.emit(this.selectedRow.numero_po);
    }
  }
}