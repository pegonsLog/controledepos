import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Po } from '../../modelos/po';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, take, map } from 'rxjs/operators';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { PoService } from '../../services/po.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import * as moment from 'moment';

export const MY_MOMENT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false, strict: false } }
  ]
})
export class PoFormComponent implements OnInit {
  poForm!: FormGroup;
  isEditMode = false;
  poAtual: Po | null = null;
  currentPoNumero: string | null = null;
  pageTitle = 'Novo PO';
  isLoading = false;

  // Observables para os dropdowns
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
    private poService: PoService
  ) { }

  ngOnInit(): void {
    this.currentPoNumero = this.route.snapshot.paramMap.get('numero_po');
    this.isEditMode = !!this.currentPoNumero;
    this.pageTitle = this.isEditMode ? 'Alterar PO' : 'Adicionar PO';

    this.poForm = this.fb.group({
      numero_po: [{value: '', disabled: this.isEditMode}, Validators.required, this.isEditMode ? null : this.validateNumeroPoNotTaken.bind(this)], 
      data_po: [null, Validators.required],
      tipo_de_logradouro: ['', Validators.required],
      logradouro: ['', Validators.required],
      complemento: [''],
      detalhamento: [''],
      analista: ['', Validators.required],
      data_implantacao: [null, Validators.required],
      funcionario_responsavel: ['', Validators.required],
      bairro: ['', Validators.required],
      observacoes: [''],
      especificacoes: [''],
      e_mail: ['', [Validators.required, Validators.email]],
      situacao: ['', Validators.required],
      solicitante: ['', Validators.required],
      tipo_de_solicitante: ['', Validators.required],
      data_enc_dro: [null],
      link_do_po: [''],
      numero_de_controle: [''],
      data_arquivamento: [null],
    });

    // Carregar dados para os dropdowns
    this.tiposLogradouro$ = this.googleSheetsService.getTiposLogradouro();
    this.analistas$ = this.googleSheetsService.getAnalistas();
    this.funcionariosResponsaveis$ = this.googleSheetsService.getFuncionariosResponsaveis();
    this.situacoes$ = this.googleSheetsService.getSituacoes();
    this.tiposDeSolicitante$ = this.googleSheetsService.getTiposDeSolicitante();

    if (this.isEditMode && this.currentPoNumero) {
      this.loadPoData(this.currentPoNumero);
    }
  }

  loadPoData(numeroPo: string): void {
    this.isLoading = true;
    this.poService.getPo(numeroPo).then(po => {
      if (po) {
        this.poAtual = po; 
        this.poForm.patchValue(this.poAtual);
        this.patchDateFields(this.poAtual);
      } else {
        alert('PO não encontrado.');
        this.router.navigate(['/lista-pos']);
      }
      this.isLoading = false;
    }).catch(err => {
      console.error('Erro ao carregar PO:', err);
      alert('Erro ao carregar PO.');
      this.isLoading = false;
      this.router.navigate(['/lista-pos']);
    });
  }

  private patchDateFields(po: Po): void {
    const dateFields: (keyof Po)[] = ['data_po', 'data_implantacao', 'data_enc_dro', 'data_arquivamento'];
    const patch: { [key: string]: any } = {};
    dateFields.forEach(field => {
      const value = po[field];
      if (typeof value === 'string' && value) {
        let date = this.parseYYYYMMDD(value) || this.parseDDMMYYYY(value);
        if (date && !isNaN(date.getTime())) {
          patch[field] = date; 
        }
      }
    });
    if (Object.keys(patch).length > 0) {
      this.poForm.patchValue(patch);
    }
  }

  private parseYYYYMMDD(dateString: string): Date | null {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
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
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.poForm.invalid) {
      console.log('Formulário inválido');
      this.poForm.markAllAsTouched();
      if (this.poForm.get('numero_po')?.hasError('numeroPoTaken')){
        alert('Este Número de PO já existe. Por favor, escolha outro.');
      }
      return;
    }
    this.isLoading = true;
    const formValue = this.poForm.getRawValue(); 

    const poDataParaSalvar: Partial<Po> = { ...formValue };

    // Converter datas do formulário (que podem ser Date objects) para string YYYY-MM-DD
    const dateFieldsToFormat: (keyof Po)[] = ['data_po', 'data_implantacao', 'data_enc_dro', 'data_arquivamento'];
    for (const field of dateFieldsToFormat) {
      const fieldValue = poDataParaSalvar[field];
      // Check if fieldValue is an object and an instance of Date
      if (typeof fieldValue === 'object' && fieldValue !== null && (fieldValue as any) instanceof Date) {
        poDataParaSalvar[field] = this.formatDateToString(fieldValue as Date);
      } else if (typeof fieldValue === 'string') {
        // If it's already a string, assume it's in the correct format or doesn't need re-formatting by formatDateToString.
        // formatDateToString expects a Date object.
        poDataParaSalvar[field] = fieldValue;
      }
    }

    const now = new Date().toISOString();

    if (this.isEditMode && this.poAtual && this.poAtual.id) {
      poDataParaSalvar.ultima_edicao = now;
      this.poService.updatePo(this.poAtual.id, poDataParaSalvar).then(() => {
        alert('PO atualizado com sucesso!');
        this.router.navigate(['/lista-pos']);
      }).catch(err => {
        console.error('Erro ao atualizar PO:', err);
        alert('Erro ao atualizar PO.');
      }).finally(() => this.isLoading = false);
    } else {
      poDataParaSalvar.criado_em = now;
      poDataParaSalvar.ultima_edicao = now;
      this.poService.addPo(poDataParaSalvar as Po).then(() => {
        alert('PO adicionado com sucesso!');
        this.router.navigate(['/lista-pos']);
      }).catch(err => {
        console.error('Erro ao adicionar PO:', err);
        alert('Erro ao adicionar PO.');
      }).finally(() => this.isLoading = false);
    }
  }

  formatDateToString(date: Date | string | null): string { // Return type changed to string
    if (!date) return ''; // Return empty string for null
    let d: Date | null = null;
    if (typeof date === 'string') {
      d = this.parseYYYYMMDD(date) || this.parseDDMMYYYY(date);
      if (!d) return date; // Return original string if parsing fails (or '' if preferred)
    } else if (date instanceof Date && !isNaN(date.getTime())) {
      d = date;
    }

    if (d instanceof Date && !isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }
    return ''; // Return empty string for invalid dates
  }

  // Validador assíncrono para numero_po
  validateNumeroPoNotTaken(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null); 
    }

    return new Observable<ValidationErrors | null>(observer => {
      this.poService.checkNumeroPoExists(control.value)
        .then(isTaken => {
          if (isTaken) {
            observer.next({ numeroPoTaken: true });
          } else {
            observer.next(null);
          }
          observer.complete();
        })
        .catch(error => {
          console.error('Erro na validação de numero_po:', error);
          observer.next(null); 
          observer.complete();
        });
    });
  }

  cancelar(): void {
    this.router.navigate(['/lista-pos']);
  }
}
