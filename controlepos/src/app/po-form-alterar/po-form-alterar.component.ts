import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Po } from '../modelos/po';
import { PoService } from '../services/po.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

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
      tipo_logradouro: ['', Validators.required],
      logradouro: ['', Validators.required],
      complemento: [''],
      analista: ['', Validators.required],
      data_implantacao: ['', Validators.required],
      funcionario_responsavel: ['', Validators.required],
      bairro: ['', Validators.required],
      observacoes: [''],
      detalhamento: [''],
      especificacoes: [''],
      situacao: ['', Validators.required],
      solicitante: ['', Validators.required],
      tipo_solicitante: ['', Validators.required],
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
          this.router.navigate([`/lista-pos/${this.sheetName}`]);
        }
      }),
      catchError(err => {
        this.snackBar.open('Erro ao carregar dados do PO.', 'Fechar', { duration: 3000 });
        this.router.navigate([`/lista-pos/${this.sheetName}`]);
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
        this.router.navigate([`/lista-pos/${this.sheetName}`]);
      }
    });
  }

  cancelar(): void {
    if (this.sheetName) {
      this.router.navigate([`/lista-pos/${this.sheetName}`]);
    } else {
      this.router.navigate(['/']);
    }
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
      // Adicionar validação mais robusta se necessário (ex: para datas como '31/12/99')
      const year = parseInt(parts[2], 10) < 70 ? `20${parts[2]}` : `19${parts[2]}`; // Simples heurística para século
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // YYYY-MM-DD
    }
    return dateDMY; // Retorna o original se não estiver no formato esperado
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
