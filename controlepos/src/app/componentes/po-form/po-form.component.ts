import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Po } from '../../modelos/po'; // Ajuste o caminho se necessário

// Imports para Standalone Component e Angular Material
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necessário para MatDatepicker
import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon'; // Opcional, se for usar ícones

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    // MatIconModule
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss']
})
export class PoFormComponent implements OnInit {
  poForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.poForm = this.fb.group({
      numero_do_po: ['', Validators.required],
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
  }

  onSubmit(): void {
    if (this.poForm.valid) {
      console.log('Formulário enviado:', this.poForm.value as Po);
    } else {
      console.log('Formulário inválido');
      this.poForm.markAllAsTouched();
    }
  }
}
