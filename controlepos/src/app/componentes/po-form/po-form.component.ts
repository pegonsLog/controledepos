import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Po } from '../../modelos/po';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { PoService } from '../../services/po.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importar
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule, // Adicionar
    NgxMaskDirective
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss'],
  providers: [provideNgxMask()]
})
export class PoFormComponent implements OnInit, OnDestroy {
  poForm!: FormGroup;
  isEditMode = false;
  currentPoNumero: string | null = null;
  sheetName: string | null = null; // Para armazenar o nome da aba (Oeste/Barreiro)
  pageTitle = 'Novo PO';
  isLoading = false;
  private routeSubscription: Subscription | undefined;
  private poSubscription: Subscription | undefined;

  tiposLogradouro$!: Observable<string[]>;
  analistas$!: Observable<string[]>;
  funcionariosResponsaveis$!: Observable<string[]>;
  situacoes$!: Observable<string[]>;
  tiposDeSolicitante$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private googleSheetsService: GoogleSheetsService,
    private poService: PoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.currentPoNumero = params.get('numero_po'); // Pode ser 'numero_po' ou 'id', ajuste conforme suas rotas
      this.sheetName = params.get('sheetName');

      if (!this.sheetName) {
        console.error('SheetName não encontrado nos parâmetros da rota!');
        this.snackBar.open('Erro: Contexto da planilha (Oeste/Barreiro) não definido.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/']); // Navega para uma rota padrão ou de erro
        return;
      }

      this.isEditMode = !!this.currentPoNumero;
      this.pageTitle = this.isEditMode ? `Alterar PO (${this.sheetName})` : `Adicionar PO (${this.sheetName})`;
      this.initializeForm();

      if (this.isEditMode && this.currentPoNumero) {
        this.loadPoData(this.currentPoNumero, this.sheetName);
      } else {
        this.isLoading = false;
      }
    });

    this.loadDropdownData();
  }

  private initializeForm(): void {
    this.poForm = this.fb.group({
      numero_po: [{ value: '', disabled: this.isEditMode }, Validators.required],
      data_po: ['', Validators.required],
      tipo_logradouro: [''],
      logradouro: ['', Validators.required],
      complemento: [''],
      detalhamento: [''],
      analista: [''],
      data_implantacao: [''],
      funcionario_responsavel: [''],
      bairro: [''],
      observacoes: [''],
      especificacoes: [''],
      situacao: [''],
      solicitante: [''],
      tipo_solicitante: [''],
      data_enc_dro: [''], // Não obrigatório
      numero_controle: [''],
      data_arquivamento: [''], // Não obrigatório
      // Adicione aqui os campos 'criado_em' e 'ultima_edicao' se precisar gerenciá-los no form,
      // mas geralmente são gerenciados pelo backend/AppScript.
      // criado_em: [{ value: '', disabled: true }],
      // ultima_edicao: [{ value: '', disabled: true }]
    });
  }

  private loadDropdownData(): void {
    this.tiposLogradouro$ = this.googleSheetsService.getTiposLogradouro().pipe(
      catchError(error => { 
        this.snackBar.open('Erro ao carregar tipos de logradouro', 'Fechar', { duration: 3000 });
        return of([]);
      })
    );
    this.analistas$ = this.googleSheetsService.getAnalistas().pipe(
      catchError(error => { 
        this.snackBar.open('Erro ao carregar analistas', 'Fechar', { duration: 3000 });
        return of([]);
      })
    );
    this.funcionariosResponsaveis$ = this.googleSheetsService.getFuncionariosResponsaveis().pipe(
      catchError(error => { 
        this.snackBar.open('Erro ao carregar funcionários responsáveis', 'Fechar', { duration: 3000 });
        return of([]);
      })
    );
    this.situacoes$ = this.googleSheetsService.getSituacoes().pipe(
      catchError(error => { 
        this.snackBar.open('Erro ao carregar situações', 'Fechar', { duration: 3000 });
        return of([]);
      })
    );
    this.tiposDeSolicitante$ = this.googleSheetsService.getTiposDeSolicitante().pipe(
      catchError(error => { 
        this.snackBar.open('Erro ao carregar tipos de solicitante', 'Fechar', { duration: 3000 });
        return of([]);
      })
    );
  }

  private loadPoData(numero_po: string, sheetName: string): void {
    this.isLoading = true;
    this.poSubscription = this.poService.getPoByNumeroPo(numero_po, sheetName).pipe(
      tap(po => {
        if (po) {
          // Converte as strings de data 'YYYY-MM-DD' para objetos Date antes de popular o formulário
          const poWithDatesAsObjects: any = { ...po };
          const dateFields: (keyof Po)[] = ['data_po', 'data_implantacao', 'data_enc_dro', 'data_arquivamento'];
          
          dateFields.forEach(field => {
            const dateValue = po[field];
            if (typeof dateValue === 'string' && dateValue) {
              poWithDatesAsObjects[field] = this.parseYYYYMMDDToDate(dateValue);
            }
          });
          // Remove espaços extras dos campos relevantes
          if (typeof poWithDatesAsObjects.tipo_logradouro === 'string') {
            poWithDatesAsObjects.tipo_logradouro = poWithDatesAsObjects.tipo_logradouro.trim();
          }
          if (typeof poWithDatesAsObjects.tipo_solicitante === 'string') {
            poWithDatesAsObjects.tipo_solicitante = poWithDatesAsObjects.tipo_solicitante.trim();
          }

          // console.log('Dados do PO para o formulário (loadPoData DEPOIS DO TRIM):', JSON.stringify(poWithDatesAsObjects));
          // console.log('Valor para Analista (do PO):', poWithDatesAsObjects.analista);
          // console.log('Valor para Situação (do PO):', poWithDatesAsObjects.situacao);
          // console.log('Valor para Tipo Logradouro (do PO DEPOIS DO TRIM):', poWithDatesAsObjects.tipo_logradouro);
          // console.log('Valor para Funcionário Responsável (do PO):', poWithDatesAsObjects.funcionario_responsavel);
          // console.log('Valor para Tipo Solicitante (do PO DEPOIS DO TRIM):', poWithDatesAsObjects.tipo_solicitante);
          this.poForm.patchValue(poWithDatesAsObjects);
        } else {
          this.snackBar.open(`PO com número ${numero_po} não encontrado na planilha ${sheetName}.`, 'Fechar', { duration: 3000 });
          this.router.navigate([`/lista-pos/${this.sheetName}`]);
        }
      }),
      catchError(err => {
        console.error('Erro ao carregar PO:', err);
        this.snackBar.open('Erro ao carregar dados do PO.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        return of(null); // Retorna um observable nulo para completar a cadeia
      })
    ).subscribe(() => {
      this.isLoading = false;
    });
  }

  // Converte string 'YYYY-MM-DD' para objeto Date
  private parseYYYYMMDDToDate(dateString: string): Date | null {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado no Date
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(Date.UTC(year, month, day)); // Usar UTC para evitar problemas de fuso
         if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
            return date;
        }
      }
    }
    console.warn(`Formato de data inválido recebido: ${dateString}. Esperado YYYY-MM-DD.`);
    return null;
  }

  private parseToDisplayFormat(dateYMD: string | undefined): string {
    if (!dateYMD) return '';
    const parts = dateYMD.split('-'); // YYYY-MM-DD
    if (parts.length === 3) {
      const year = parts[0].slice(-2); // Pega os últimos 2 dígitos do ano
      return `${parts[2]}/${parts[1]}/${year}`; // dd/MM/yy
    }
    return dateYMD; // Retorna o original se não estiver no formato esperado
  }

  private parseToModelFormat(dateDMY: string | undefined): string {
    if (!dateDMY) return '';
    const parts = dateDMY.split('/'); // dd/MM/yy
    if (parts.length === 3) {
      // Assume que 'yy' se refere ao século 21 (20xx)
      const year = parseInt(parts[2], 10) < 70 ? `20${parts[2]}` : `19${parts[2]}`; // Simples heurística para século
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // YYYY-MM-DD
    }
    return dateDMY; // Retorna o original se não estiver no formato esperado
  }

  onSubmit(): void {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.sheetName) {
      this.snackBar.open('Contexto da planilha (Oeste/Barreiro) não definido. Não é possível salvar.', 'Fechar', { duration: 5000 });
      return;
    }

    this.isLoading = true;
    const rawFormValue = this.poForm.getRawValue(); // Inclui campos desabilitados (como numero_po em edição)
    
    // Formata as datas para string antes de enviar
    const poData: Po = {
      ...rawFormValue,
      data_po: this.parseToModelFormat(rawFormValue.data_po),
      data_implantacao: this.parseToModelFormat(rawFormValue.data_implantacao),
      data_enc_dro: this.parseToModelFormat(rawFormValue.data_enc_dro),
      data_arquivamento: this.parseToModelFormat(rawFormValue.data_arquivamento),
      // Se numero_po é desabilitado e não vem no rawFormValue em edicao, pega do currentPoNumero
      numero_po: this.isEditMode && this.currentPoNumero ? this.currentPoNumero : rawFormValue.numero_po
    };

    // Adiciona/atualiza timestamps se o AppScript não fizer isso
    // poData.ultima_edicao = new Date().toISOString();
    // if (!this.isEditMode) {
    //   poData.criado_em = new Date().toISOString();
    // }


    let operation$: Observable<any>;

    if (this.isEditMode) {
      operation$ = this.poService.atualizarPo(poData, this.sheetName);
    } else {
      operation$ = this.poService.adicionarPo(poData, this.sheetName);
    }

    this.poSubscription = operation$.pipe(
      catchError(err => {
        console.error('Erro ao salvar PO:', err);
        this.snackBar.open(`Erro ao salvar PO: ${err.message || 'Erro desconhecido.'}`, 'Fechar', { duration: 5000 });
        this.isLoading = false;
        return of(null); // Para completar a cadeia e evitar que o complete não seja chamado
      })
    ).subscribe(response => {
      this.isLoading = false;
      if (response && response !== null) { // Verifica se não houve erro (null retornado pelo catchError)
        this.snackBar.open(`PO ${this.isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.router.navigate([`/po-lista/${this.sheetName}`]);
      }
    });
  }

  cancelar(): void {
    if (this.sheetName) {
      this.router.navigate([`/po-lista/${this.sheetName}`]);
    } else {
      // Fallback se sheetName não estiver definido, embora a guarda no ngOnInit deva prevenir isso.
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.poSubscription) {
      this.poSubscription.unsubscribe();
    }
  }
}
