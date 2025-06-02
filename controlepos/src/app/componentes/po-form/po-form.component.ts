import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Po } from '../../modelos/po';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { PoService } from '../../services/po.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


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
      numero_po: [{value: '', disabled: this.isEditMode}, Validators.required], 
      data_po: ['', Validators.required],
      tipo_logradouro: ['', Validators.required],
      logradouro: ['', Validators.required],
      complemento: [''],
      detalhamento: [''],
      analista: ['', Validators.required],
      data_implantacao: ['', Validators.required],
      funcionario_responsavel: ['', Validators.required],
      bairro: ['', Validators.required],
      observacoes: [''],
      especificacoes: [''],
      situacao: ['', Validators.required],
      solicitante: ['', Validators.required],
      tipo_solicitante: ['', Validators.required],
      data_enc_dro: ['', Validators.required],
      numero_controle: [''],
      data_arquivamento: ['', Validators.required],
    });

    // Carregar dados para os dropdowns
    this.tiposLogradouro$ = this.googleSheetsService.getTiposLogradouro();
    this.analistas$ = this.googleSheetsService.getAnalistas();
    this.funcionariosResponsaveis$ = this.googleSheetsService.getFuncionariosResponsaveis();
    this.situacoes$ = this.googleSheetsService.getSituacoes();
    this.tiposDeSolicitante$ = this.googleSheetsService.getTiposDeSolicitante();

    // Se necessário, carregue dados de outra fonte aqui.
  }

  private patchDateFields(po: Po): void {
    const dateFields: (keyof Po)[] = ['data_po', 'data_implantacao', 'data_enc_dro', 'data_arquivamento'];
    const patch: { [key: string]: any } = {};
    dateFields.forEach(field => {
      const value = po[field];
      if (typeof value === 'string' && value) {
        let date = this.parseYYYYMMDD(value);
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

  onSubmit(): void {
    if (this.poForm.invalid) {
      console.log('Formulário inválido');
      this.poForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formValue = this.poForm.getRawValue(); 
    // Aqui você pode implementar a lógica local de salvamento, ou apenas mostrar os dados no console:
    console.log('Dados do formulário salvos:', formValue);
    alert('PO salvo localmente!');
    this.isLoading = false;
    this.router.navigate(['/lista-pos']);
  }

  cancelar(): void {
    this.router.navigate(['/lista-pos']);
  }
}
