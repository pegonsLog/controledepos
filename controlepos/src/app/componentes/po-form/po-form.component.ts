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
import * as moment from 'moment';

const MOCK_POS_DATA: Po[] = [
  { numero_do_po: 'PO-001', data_po: '2024-01-15', analista: 'João Silva', situacao: 'Em Andamento', solicitante: 'Empresa A', bairro: 'Centro', tipo_de_logradouro: 'Rua', logradouro: 'Principal', complemento: 'Sala 101', detalhamento: 'Detalhamento específico para o PO-001 sobre a instalação.', data_implantacao: '2024-01-20', funcionario_responsavel: 'Carlos P.', observacoes: 'Urgente', especificacoes: 'Padrão', e_mail: 'joao@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-02-01', link_do_po: 'http://link.com/po001', numero_de_controle: 'CTRL001', data_arquivamento: '2024-02-05', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-002', data_po: '2024-02-20', analista: 'Maria Oliveira', situacao: 'Concluído', solicitante: 'Empresa B', bairro: 'Vila Nova', tipo_de_logradouro: 'Avenida', logradouro: 'Central', complemento: 'Andar 5', detalhamento: 'Detalhamento do PO-002: revisão de escopo concluída.', data_implantacao: '2024-02-25', funcionario_responsavel: 'Ana R.', observacoes: 'Revisado', especificacoes: 'Customizado', e_mail: 'maria@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: '2024-03-10', link_do_po: 'http://link.com/po002', numero_de_controle: 'CTRL002', data_arquivamento: '2024-03-15', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-003', data_po: '2023-12-10', analista: 'Pedro Costa', situacao: 'Pendente', solicitante: 'Empresa C', bairro: 'Jardins', tipo_de_logradouro: 'Praça', logradouro: 'Circular', complemento: 'Loja 3', detalhamento: 'PO-003: Aguardando aprovação do cliente.', data_implantacao: '2023-12-15', funcionario_responsavel: 'Sofia L.', observacoes: '', especificacoes: 'Básico', e_mail: 'pedro@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: '2024-01-05', link_do_po: 'http://link.com/po003', numero_de_controle: 'CTRL003', data_arquivamento: '2024-01-10', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() }
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

  // Função para converter string YYYY-MM-DD para Date
  private parseDateString(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado em Date
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return null; // Retorna null se a string não estiver no formato esperado
  }

  // Função para converter Date para string YYYY-MM-DD
  private formatDateToString(date: Date | moment.Moment | null | undefined): string | null {
    if (!date) return null;
    if (moment.isMoment(date)) {
      return date.format('YYYY-MM-DD');
    }
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentPoNumero = this.route.snapshot.paramMap.get('numero_do_po');
    this.isEditMode = !!this.currentPoNumero;
    this.pageTitle = this.isEditMode ? 'Alterar PO' : 'Adicionar PO';

    this.poForm = this.fb.group({
      numero_do_po: [{value: '', disabled: this.isEditMode}, Validators.required], 
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

    if (this.isEditMode && this.currentPoNumero) {
      const poToEdit = MOCK_POS_DATA.find(p => p.numero_do_po === this.currentPoNumero);
      if (poToEdit) {
        // Converter strings de data para objetos Date antes de patchValue
        const poDataForForm = {
          ...poToEdit,
          data_po: this.parseDateString(poToEdit.data_po),
          data_implantacao: this.parseDateString(poToEdit.data_implantacao),
          data_enc_dro: this.parseDateString(poToEdit.data_enc_dro),
          data_arquivamento: this.parseDateString(poToEdit.data_arquivamento),
        };
        this.poForm.patchValue(poDataForForm);
      } else {
        console.error('PO não encontrado para edição:', this.currentPoNumero);
        this.router.navigate(['/lista-pos']);
      }
    }
  }

  onSubmit(): void {
    if (this.poForm.valid) {
      const formData = this.poForm.getRawValue(); 
      
      // Converter datas do formulário (objetos Date/Moment) para string YYYY-MM-DD
      const poDataParaSalvar: Po = {
        ...(this.isEditMode && this.currentPoNumero ? { numero_do_po: this.currentPoNumero } : {}),
        ...formData,
        data_po: this.formatDateToString(formData.data_po),
        data_implantacao: this.formatDateToString(formData.data_implantacao),
        data_enc_dro: this.formatDateToString(formData.data_enc_dro),
        data_arquivamento: this.formatDateToString(formData.data_arquivamento),
        // criado_em e ultima_edicao são tratados separadamente abaixo
      } as Po;

      if (this.isEditMode) {
        console.log('Atualizando PO:', poDataParaSalvar);
        const index = MOCK_POS_DATA.findIndex(p => p.numero_do_po === this.currentPoNumero);
        if (index !== -1) {
          MOCK_POS_DATA[index] = { 
            ...MOCK_POS_DATA[index], // Mantém campos não editáveis como criado_em
            ...poDataParaSalvar, 
            ultima_edicao: new Date().toISOString() 
          };
        }
      } else {
        poDataParaSalvar.criado_em = new Date().toISOString();
        poDataParaSalvar.ultima_edicao = new Date().toISOString();
        console.log('Criando Novo PO:', poDataParaSalvar);
        MOCK_POS_DATA.push(poDataParaSalvar);
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

  voltarParaLista(): void {
    this.router.navigate(['/lista-pos']); 
  }
}
