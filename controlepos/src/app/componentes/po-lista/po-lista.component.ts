import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Importar MatDialog e MatDialogModule
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBar e MatSnackBarModule
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Po } from '../../modelos/po';
import { PoService } from '../../services/po.service';
import { UsuarioService } from '../../services/usuario.service'; // Adicionado para controle de acesso
import { CacheService } from '../../services/cache.service'; // Importar CacheService

// Importe o ConfirmDialogComponent após criá-lo. Por enquanto, vamos simular sua existência.
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// Interface Planilha e array planilhas não são mais necessários com a abordagem de rota
// interface Planilha {
//   dados: any[];
// }

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateStringPipe } from '../date-string.pipe';
import { PdfListComponent } from '../pdf-list/pdf-list.component';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    DateStringPipe,
    PdfListComponent
  ]
})
export class PoListaComponent implements OnInit, AfterViewInit {
  public isAdminUser = false; // Adicionado para controle de acesso
  isLoading: boolean = false;
  public sheetName: string = '';
  selectedRow: Po | null = null; // Para rastrear a linha selecionada
  pos: Po[] = [];
  @Output() selecionarPo = new EventEmitter<string>();

  visualizarPo(po: Po) {
    if (!this.currentSheetName) {
      this.snackBar.open('Contexto da planilha não definido. Não é possível visualizar.', 'Fechar', { duration: 3000 });
      return;
    }
    this.router.navigate(['/po/detalhes', this.currentSheetName, po.numero_po]);
  }

  alterarPo(po: Po) {
    if (!this.currentSheetName) {
      this.snackBar.open('Contexto da planilha não definido. Não é possível alterar.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!po || !po.numero_po) { // Adicionar verificação para po e po.numero_po
      this.snackBar.open('Dados do PO inválidos para alteração.', 'Fechar', { duration: 3000 });
      return;
    }
    // Navegar para a rota de edição, usando o numero_po e sheetName
    this.router.navigate(['/alterar-po', this.currentSheetName, encodeURIComponent(po.numero_po)]);
  }

  deletarPo(po: Po) {
    if (!this.currentSheetName) {
      this.snackBar.open('Contexto da planilha não definido. Não é possível deletar.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { title: 'Confirmar Exclusão', message: `Tem certeza que deseja excluir o PO: ${po.numero_po} da planilha ${this.currentSheetName}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Se o usuário confirmou (clicou em "Sim")
        this.isLoading = true;
        this.poService.excluir(po.numero_po, this.currentSheetName).subscribe({
          next: () => {
            this.isLoading = false;
            this.pos = this.pos.filter(p => p.numero_po !== po.numero_po);
            this.dataSource.data = this.pos;
            this.totalItems = this.pos.length;
            this.snackBar.open(`PO ${po.numero_po} excluído com sucesso da planilha ${this.currentSheetName}!`, 'Fechar', { duration: 3000 });
            // Se a fonte de dados for o servidor, pode ser necessário recarregar: this.loadDataForSheet();
          },
          error: (err: unknown) => {
            this.isLoading = false;
            const errorMessage = (err as any)?.message || 'Ocorreu um erro desconhecido.';
            this.snackBar.open(`Erro ao excluir PO ${po.numero_po}: ${errorMessage}`, 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }

  onSortChange(event: any): void {
    // Implemente aqui a lógica de ordenação conforme necessário
  }

  navegarParaMenu() {
    this.router.navigate(['/menu']);
  }

  irParaDashboard() {
    this.router.navigate(['/dashboard-po']);
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

  @ViewChild(PdfListComponent) pdfListComponent!: PdfListComponent;

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

  dataSource = new MatTableDataSource<Po>([]);
  filtro: string = '';
  filtro2: string = '';
  filtro3: string = '';
  filtro4: string = '';
  filtroAnoInicio!: number;
  filtroAnoFim!: number;

  currentSheetName: string = ''; // Para armazenar o nome da aba atual
  idDaPlanilha = '1AQjzxBPFKxwfAGolCxvzOEcQBs5Z-0yKUKIxsjDXdAI';
  modoCarregamentoOtimizado: boolean = true; // Controla se estamos no modo de carregamento otimizado

  constructor(
    private poService: PoService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute, // Injete ActivatedRoute
    private dialog: MatDialog, // Injetar MatDialog
    private snackBar: MatSnackBar, // Injetar MatSnackBar
    private usuarioService: UsuarioService, // Adicionado para controle de acesso
    private cacheService: CacheService // Injetar CacheService
  ) { }

  ngOnInit() {
    this.isAdminUser = this.usuarioService.isAdmin(); // Adicionado para controle de acesso
    this.isLoading = true;
    const anoAtual = new Date().getFullYear();
    this.filtroAnoInicio = anoAtual - 5;
    this.filtroAnoFim = anoAtual;

    this.route.paramMap.subscribe(params => {
      const sheetNameParam = params.get('sheetName');
      if (sheetNameParam) {
        this.sheetName = sheetNameParam;
        this.currentSheetName = sheetNameParam;
        this.loadDataForSheet();
      } else {
        // Tratar caso onde sheetName não está presente, talvez redirecionar ou carregar um padrão
        this.sheetName = 'Oeste'; // Fallback para Oeste ou outra lógica
        this.currentSheetName = 'Oeste'; // Fallback para Oeste ou outra lógica
        this.loadDataForSheet(); // Ou mostrar uma mensagem de erro
        // this.router.navigate(['/menu']); // Exemplo de redirecionamento
      }
    });
  }

  loadDataForSheet() {
    if (!this.currentSheetName) return;
    // Carrega apenas os primeiros 5 registros para otimizar a performance inicial
    this.carregarPrimeirosRegistros();
  }

  // Método para carregar apenas os primeiros 5 registros (otimização)
  carregarPrimeirosRegistros() {
    if (!this.currentSheetName) return;

    this.isLoading = true;
    console.log('Carregando primeiros 5 registros para otimizar performance...');

    this.poService.listarPrimeiros(this.currentSheetName, 5).subscribe({
      next: (pos) => {
        this.pos = pos;
        this.dataSource.data = pos;
        this.totalItems = pos.length;
        this.isLoading = false;



        console.log(`Carregados ${pos.length} registros iniciais para ${this.currentSheetName}`);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(`Erro ao carregar dados da planilha ${this.currentSheetName}.`, 'Fechar', { duration: 3000 });
        console.error('Erro ao carregar primeiros registros:', error);
      }
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
    // Verifica se todos os filtros estão vazios
    const todosOsFiltrosVazios = !this.filtro && !this.filtro2 && !this.filtro3 && !this.filtro4;

    if (todosOsFiltrosVazios) {
      // Se todos os filtros estão vazios, volta ao modo otimizado
      this.modoCarregamentoOtimizado = true;
      this.carregarPrimeirosRegistros();
    } else {
      // Se há algum filtro, sai do modo otimizado e busca todos os dados
      this.modoCarregamentoOtimizado = false;
      this.buscarNaGoogleSheets(this.filtro);
    }
  }

  async buscarNaGoogleSheets(filtroPrincipal: string) {
    if (!this.currentSheetName) {
      this.snackBar.open('Contexto da planilha não definido para busca.', 'Fechar', { duration: 3000 });
      return;
    }
    this.isLoading = true;

    const aplicarFiltrosSecundarios = (dados: Po[]) => {
      let dadosFiltrados = dados;
      if (this.filtro2) {
        dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro2));
      }
      if (this.filtro3) {
        dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro3));
      }
      if (this.filtro4) {
        dadosFiltrados = dadosFiltrados.filter(item => this.itemContemTermo(item, this.filtro4));
      }

      // Adiciona o filtro por período (ano)
      if (this.filtroAnoInicio && this.filtroAnoFim) {
        dadosFiltrados = dadosFiltrados.filter(item => {
          if (!item.data_po) {
            return false;
          }
          // Extrai o ano da data. A data pode estar em formatos diferentes.
          // Esta abordagem tenta ser robusta.
          const data = new Date(item.data_po);
          if (isNaN(data.getTime())) {
            // Se a data não for válida, tenta converter de DD/MM/YYYY para YYYY-MM-DD
            const parts = String(item.data_po).split('/');
            if (parts.length === 3) {
              const [dia, mes, ano] = parts;
              const dataCorrigida = new Date(`${ano}-${mes}-${dia}`);
              if (!isNaN(dataCorrigida.getTime())) {
                const anoPo = dataCorrigida.getFullYear();
                return anoPo >= this.filtroAnoInicio && anoPo <= this.filtroAnoFim;
              }
            }
            return false; // Se ainda assim for inválida, não inclui o item
          }
          const anoPo = data.getFullYear();
          return anoPo >= this.filtroAnoInicio && anoPo <= this.filtroAnoFim;
        });
      }
      // Ordenar por 'data_po' em ordem decrescente
      dadosFiltrados.sort((a, b) => {
        const parseDate = (dateStr: any): Date | null => {
          if (!dateStr) return null;
          let data = new Date(dateStr);
          if (isNaN(data.getTime())) {
            const parts = String(dateStr).split('/');
            if (parts.length === 3) {
              const [dia, mes, ano] = parts;
              // O mês no construtor do Date é 0-indexado (0-11)
              data = new Date(Number(ano), Number(mes) - 1, Number(dia));
            }
          }
          return isNaN(data.getTime()) ? null : data;
        };

        const dateA = parseDate(a.data_po);
        const dateB = parseDate(b.data_po);

        if (dateA && dateB) {
          return dateB.getTime() - dateA.getTime(); // Descendente
        }
        return 0; // Mantém a ordem original se as datas forem inválidas
      });

      this.pos = dadosFiltrados; // Atualiza a lista base para consistência, se necessário
      this.dataSource.data = dadosFiltrados;
      this.totalItems = dadosFiltrados.length;
      this.isLoading = false;
    };

    // Se não há filtro principal, tentar usar o cache
    if (!filtroPrincipal || filtroPrincipal.trim() === '') {
      const dadosEmCache = await this.cacheService.getDadosPesquisa(this.currentSheetName!);
      if (dadosEmCache) { // Se dadosEmCache não for undefined, significa que encontramos para o sheetName atual
        console.log('Dados carregados do cache (IndexedDB) para:', this.currentSheetName);
        aplicarFiltrosSecundarios(dadosEmCache);
        return;
      }

      // Se não há cache para o sheetName atual, buscar da API e salvar no cache
      this.poService.listar(this.currentSheetName!, '').subscribe(
        async pos => { // Marcar como async para usar await dentro
          console.log('Dados buscados da API e salvos no cache (IndexedDB) para:', this.currentSheetName);
          await this.cacheService.setDadosPesquisa(this.currentSheetName!, pos);
          aplicarFiltrosSecundarios(pos);
        },
        error => {
          this.isLoading = false;
          this.snackBar.open(`Erro ao buscar dados na planilha ${this.currentSheetName}.`, 'Fechar', { duration: 3000 });
        }
      );
    } else {
      // Se há filtro principal, buscar da API (não salva no cache)
      this.poService.listar(this.currentSheetName, filtroPrincipal).subscribe(
        pos => {
          console.log('Dados buscados da API com filtro principal:', filtroPrincipal);
          aplicarFiltrosSecundarios(pos);
        },
        error => {
          this.isLoading = false;
          this.snackBar.open(`Erro ao buscar dados (com filtro) na planilha ${this.currentSheetName}.`, 'Fechar', { duration: 3000 });
        }
      );
    }
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

  // Método para extrair 7 dígitos do número do PO (finalizando 3 algarismos antes do fim)
  extrairNumeroParaPdf(numeroPo: string): string {
    if (!numeroPo) return '';

    // Remove todos os caracteres não numéricos
    const apenasNumeros = numeroPo.replace(/\D/g, '');

    // Se tem menos de 7 dígitos, retorna o que tem
    if (apenasNumeros.length < 7) return apenasNumeros;

    // Para o exemplo "15VH-0046790/24":
    // apenasNumeros = "1504679024" (10 dígitos)
    // Queremos pegar "0046790" (7 dígitos)
    // Observando o padrão: "15" + "0046790" + "24"
    // Parece que queremos os 7 dígitos do meio, excluindo os primeiros e últimos

    if (apenasNumeros.length === 7) {
      return apenasNumeros; // Se tem exatamente 7, retorna todos
    }

    // Se tem mais de 7, tenta encontrar o padrão
    // Remove os últimos 2-3 dígitos (ano) e pega 7 dígitos antes disso
    const semAno = apenasNumeros.substring(0, apenasNumeros.length - 2); // Remove últimos 2 dígitos

    if (semAno.length >= 7) {
      return semAno.substring(semAno.length - 7); // Pega os últimos 7 dígitos do que sobrou
    }

    return apenasNumeros.substring(0, 7); // Fallback: pega os primeiros 7
  }

  // Método para buscar PDF automaticamente baseado no número do PO
  buscarPdfPorNumeroPo(numeroPo: string): void {
    const numeroExtraido = this.extrairNumeroParaPdf(numeroPo);
    if (numeroExtraido) {
      // Usa o ViewChild para acessar diretamente o componente pdf-list
      if (this.pdfListComponent) {
        this.pdfListComponent.aplicarFiltroAutomatico(numeroExtraido);
        // Mostra uma mensagem informativa
        this.snackBar.open(`Buscando PDFs com o número: ${numeroExtraido}`, 'Fechar', { duration: 3000 });
      } else {
        this.snackBar.open('Componente de PDFs não encontrado', 'Fechar', { duration: 3000 });
      }
    } else {
      this.snackBar.open('Não foi possível extrair número válido do PO para busca de PDF', 'Fechar', { duration: 3000 });
    }
  }

  adicionarPo() {
    if (!this.currentSheetName) {
      this.snackBar.open('Contexto da planilha não definido. Não é possível adicionar novo PO.', 'Fechar', { duration: 3000 });
      return;
    }
    // Navegar para a rota de novo PO, passando o sheetName
    this.router.navigate(['/formulario-po', this.currentSheetName]);
  }

  // Método para carregar todos os registros baseado no período de anos
  carregarTodosPorPeriodo() {
    if (!this.currentSheetName) return;
    if (!this.filtroAnoInicio || !this.filtroAnoFim) {
      this.snackBar.open('Defina o período (ano início e fim) para carregar os dados.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.modoCarregamentoOtimizado = false;
    console.log(`Carregando todos os registros do período ${this.filtroAnoInicio} - ${this.filtroAnoFim}...`);

    // Usa o método buscarNaGoogleSheets que aplicará o filtro de período
    // Os filtros de texto atuais serão mantidos e aplicados junto com o filtro de período
    this.buscarNaGoogleSheets('');
  }


}
