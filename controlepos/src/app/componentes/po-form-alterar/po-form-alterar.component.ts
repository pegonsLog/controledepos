import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PoService } from '../../services/po.service';
import { Po } from '../../modelos/po';

@Component({
  selector: 'app-po-form-alterar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,

    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  templateUrl: './po-form-alterar.component.html',
  styleUrls: ['./po-form-alterar.component.scss'],
  providers: [provideNgxMask()]
})
export class PoFormAlterarComponent implements OnInit, OnDestroy {
  poForm!: FormGroup;
  currentPoNumero: string | null = null;
  sheetName: string | null = null;
  pageTitle = 'Alterar PO'; // Título fixo
  isLoading = false;
  private routeSubscription: Subscription | undefined;
  private poSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private poService: PoService,
    private snackBar: MatSnackBar
  ) {
    }

  ngOnInit(): void {
    this.isLoading = true;
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const numeroPoParam = params.get('numero_po');
      this.currentPoNumero = numeroPoParam ? decodeURIComponent(numeroPoParam) : null;
      this.sheetName = params.get('sheetName');
      if (!this.sheetName || !this.currentPoNumero) {
        this.snackBar.open('Erro: Dados insuficientes para carregar o PO.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/']);
        return;
      }
      
      this.pageTitle = `Alterar PO (${this.sheetName}) - ${this.currentPoNumero}`;
      this.initializeForm();
      this.loadPoData(this.currentPoNumero, this.sheetName);
      });
  }

  private initializeForm(): void {
    this.poForm = this.fb.group({
      numero_po: [{ value: this.currentPoNumero, disabled: true }, Validators.required],
      data_po: ['', Validators.required],
      tipo_logradouro: [''],
      logradouro: ['', Validators.required],
      complemento: [''],
      analista: [''],
      data_implantacao: [''],
      funcionario_responsavel: [''],
      bairro: [''],
      observacoes: [''],
      detalhamento: [''],
      especificacoes: [''],
      situacao: [''],
      solicitante: [''],
      tipo_solicitante: [''],
      data_enc_dro: [''], // No HTML não há mat-error para 'required'
      numero_controle: [''],
      data_arquivamento: [''] // No HTML não há mat-error para 'required'
    });
  }

  private loadPoData(numero_po: string, sheetName: string): void {
    this.isLoading = true;
    this.poSubscription = this.poService.getPoByNumeroPo(numero_po, sheetName).pipe(
      tap((po: Po | undefined) => {
        if (po) {
          const poDataForForm = {
            ...po,
            data_po: this.parseToDisplayFormat(po.data_po),
            data_implantacao: this.parseToDisplayFormat(po.data_implantacao),
            data_enc_dro: this.parseToDisplayFormat(po.data_enc_dro),
            data_arquivamento: this.parseToDisplayFormat(po.data_arquivamento),
          };
          this.poForm.patchValue(poDataForForm);
        } else {
          this.snackBar.open(`PO com número ${numero_po} não encontrado na planilha ${sheetName}.`, 'Fechar', { duration: 3000 });
          this.router.navigate([`/po-lista/${this.sheetName}`]);
        }
      }),
      catchError(err => {
        this.snackBar.open('Erro ao carregar dados do PO.', 'Fechar', { duration: 3000 });
        this.router.navigate([`/po-lista/${this.sheetName}`]);
        this.isLoading = false; 
        return of(null);
      })
    ).subscribe(po => { 
      this.isLoading = false;
    });
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
      numero_po: this.currentPoNumero,
      data_po: this.parseToModelFormat(formValues.data_po),
      data_implantacao: this.parseToModelFormat(formValues.data_implantacao),
      data_enc_dro: this.parseToModelFormat(formValues.data_enc_dro),
      data_arquivamento: this.parseToModelFormat(formValues.data_arquivamento),
    };

    this.poSubscription = this.poService.atualizarPo(poData, this.sheetName).pipe(
      catchError(err => {
        this.snackBar.open(`Erro ao atualizar PO: ${err.message || 'Erro desconhecido.'}`, 'Fechar', { duration: 5000 });
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((response: any) => {
      this.isLoading = false;
      if (response) {
        this.snackBar.open('PO atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate([`/po-lista/${this.sheetName}`]);
      }
    });
  }

  cancelar(): void {
    if (this.sheetName) {
      this.router.navigate([`/po-lista/${this.sheetName}`]);
    } else {
      this.router.navigate(['/']);
    }
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

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.poSubscription) {
      this.poSubscription.unsubscribe();
    }
  }
}
