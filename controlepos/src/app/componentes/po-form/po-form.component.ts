import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Po } from '../../modelos/po';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';

const MOCK_POS_DATA: Po[] = [
  { numero_do_po: 'PO-001', data_po: new Date(2024, 0, 15), analista: 'João Silva', situacao: 'Em Andamento', solicitante: 'Empresa A', bairro: 'Centro', tipo_de_logradouro: 'Rua', logradouro: 'Principal', complemento_do_logradouro: 'Sala 101', data_implantacao: new Date(2024, 0, 20), funcionario_responsavel: 'Carlos P.', observacoes: 'Urgente', especificacoes: 'Padrão', e_mail: 'joao@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: new Date(2024, 1, 1), link_do_po: 'http://link.com/po001', numero_de_controle: 'CTRL001', data_arquivamento: new Date(2024, 1, 5), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-002', data_po: new Date(2024, 1, 20), analista: 'Maria Oliveira', situacao: 'Concluído', solicitante: 'Empresa B', bairro: 'Vila Nova', tipo_de_logradouro: 'Avenida', logradouro: 'Central', complemento_do_logradouro: 'Andar 5', data_implantacao: new Date(2024, 1, 25), funcionario_responsavel: 'Ana R.', observacoes: 'Revisado', especificacoes: 'Customizado', e_mail: 'maria@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: new Date(2024, 2, 10), link_do_po: 'http://link.com/po002', numero_de_controle: 'CTRL002', data_arquivamento: new Date(2024, 2, 15), criado_em: new Date(), ultima_edicao: new Date() },
  { numero_do_po: 'PO-003', data_po: new Date(2023, 11, 10), analista: 'Pedro Costa', situacao: 'Pendente', solicitante: 'Empresa C', bairro: 'Jardins', tipo_de_logradouro: 'Praça', logradouro: 'Circular', complemento_do_logradouro: 'Loja 3', data_implantacao: new Date(2023, 11, 15), funcionario_responsavel: 'Sofia L.', observacoes: '', especificacoes: 'Básico', e_mail: 'pedro@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: new Date(2024, 0, 5), link_do_po: 'http://link.com/po003', numero_de_controle: 'CTRL003', data_arquivamento: new Date(2024, 0, 10), criado_em: new Date(), ultima_edicao: new Date() }
];

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
  currentPoNumero: string | null = null;
  pageTitle = 'Novo PO';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentPoNumero = this.route.snapshot.paramMap.get('numero_do_po');
    this.isEditMode = !!this.currentPoNumero;
    this.pageTitle = this.isEditMode ? 'Editar PO' : 'Novo PO';

    this.poForm = this.fb.group({
      numero_do_po: [{value: '', disabled: this.isEditMode}, Validators.required], 
      data_po: [null, Validators.required],
      tipo_de_logradouro: ['', Validators.required],
      logradouro: ['', Validators.required],
      complemento_do_logradouro: [''],
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

    if (this.isEditMode && this.currentPoNumero) {
      const poToEdit = MOCK_POS_DATA.find(p => p.numero_do_po === this.currentPoNumero);
      if (poToEdit) {
        this.poForm.patchValue(poToEdit);
      } else {
        console.error('PO não encontrado para edição:', this.currentPoNumero);
        this.router.navigate(['/lista-pos']);
      }
    }
  }

  onSubmit(): void {
    if (this.poForm.valid) {
      const formData = this.poForm.getRawValue(); 
      
      const poDataParaSalvar: Po = {
        ...(this.isEditMode && this.currentPoNumero ? { numero_do_po: this.currentPoNumero } : {}),
        ...formData
      } as Po;

      if (this.isEditMode) {
        console.log('Atualizando PO:', poDataParaSalvar);
        const index = MOCK_POS_DATA.findIndex(p => p.numero_do_po === this.currentPoNumero);
        if (index !== -1) {
          MOCK_POS_DATA[index] = { ...MOCK_POS_DATA[index], ...poDataParaSalvar, ultima_edicao: new Date() };
        }
      } else {
        console.log('Criando Novo PO:', poDataParaSalvar);
        MOCK_POS_DATA.push({ ...poDataParaSalvar, criado_em: new Date(), ultima_edicao: new Date() });
      }
      this.router.navigate(['/lista-pos']); 
    } else {
      console.log('Formulário inválido');
      this.poForm.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.router.navigate(['/lista-pos']);
  }
}
