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
  sheetName: string | null = null; // Para armazenar o nome da aba (Oeste/Barreiro)
  pageTitle = 'Novo PO';
  isLoading = false;
  private routeSubscription: Subscription | undefined;

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
    this.isLoading = true; // Inicia como true, será false após setup inicial
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.sheetName = params.get('sheetName');

      if (!this.sheetName) {
        console.error('SheetName não encontrado nos parâmetros da rota!');
        this.snackBar.open('Erro: Contexto da planilha (Oeste/Barreiro) não definido.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/menu']); // Navega para o menu ou uma rota de erro apropriada
        return;
      }

      this.pageTitle = `Adicionar PO (${this.sheetName})`;
      this.initializeForm();
      this.loadDropdownData(); // Carrega os dados dos dropdowns
      this.isLoading = false; // Finaliza o carregamento inicial
    });
  }

  private initializeForm(): void {
    this.poForm = this.fb.group({
      numero_po: ['', Validators.required], // Sempre habilitado para novo PO
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

    private parseToDisplayFormat(dateDDMMYYYY_fromModel: string | undefined): string {
  if (!dateDDMMYYYY_fromModel || dateDDMMYYYY_fromModel.trim() === '') {
    return '';
  }
  const dateStr = dateDDMMYYYY_fromModel.trim();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    // Validação básica
    if (day.length >= 1 && day.length <= 2 &&
        month.length >= 1 && month.length <= 2 &&
        year.length === 4 &&
        !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year)) &&
        parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31 &&
        parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 &&
        parseInt(year, 10) > 0) { // Ano deve ser positivo
      return dateStr; // Retorna a string dd/MM/yyyy original se válida
    }
  }
  // console.warn(`parseToDisplayFormat: Formato inválido recebido: ${dateDDMMYYYY_fromModel}`);
  return ''; // Retorna vazio se o formato não for válido
}

  private parseToModelFormat(dateDDMMYYYY_fromForm: string | undefined): string {
    if (!dateDDMMYYYY_fromForm || dateDDMMYYYY_fromForm.trim() === '' || dateDDMMYYYY_fromForm.includes('_')) {
      // Se a máscara ainda não foi preenchida (contém '_'), retorna vazio
      return '';
    }
    const dateStr = dateDDMMYYYY_fromForm.trim();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      // A máscara 00/00/0000 deve garantir os comprimentos corretos (dd, MM, yyyy).
      // Validação dos valores numéricos.
      if (day.length === 2 && month.length === 2 && year.length === 4 &&
          !isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year)) &&
          parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31 &&
          parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 &&
          parseInt(year, 10) > 0) { // Ano deve ser positivo
        return dateStr; // Retorna a string dd/MM/yyyy original se válida
      }
    }
    // console.warn(`parseToModelFormat: Formato inválido recebido do formulário: ${dateDDMMYYYY_fromForm}`);
    return ''; // Retorna vazio se o formato não for válido
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
    const formValues = this.poForm.getRawValue();

    const poData: Po = {
      ...formValues,
      data_po: this.parseToModelFormat(formValues.data_po),
      data_implantacao: this.parseToModelFormat(formValues.data_implantacao),
      data_enc_dro: this.parseToModelFormat(formValues.data_enc_dro),
      data_arquivamento: this.parseToModelFormat(formValues.data_arquivamento),
    };

    // Adicionar novo PO
    this.poService.adicionarPo(poData, this.sheetName).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('PO adicionado com sucesso!', 'Fechar', { duration: 3000 });
        this.poForm.reset(); // Limpa o formulário
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
  }
}
