import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PoService } from '../../services/po.service';
import { Po } from '../../modelos/po';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-po-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './po-detalhes.component.html',
  styleUrls: ['./po-detalhes.component.scss']
})
export class PoDetalhesComponent implements OnInit {
  @Input() numeroPo: string = '';
  @Output() voltar = new EventEmitter<void>();
  po: Po | null = null;
  isLoading = false;

  constructor(private poService: PoService) {}

  ngOnInit() {
    if (this.numeroPo) {
      this.isLoading = true;
      this.poService.listar().subscribe(pos => {
        this.po = pos.find(p => p.numero_po === this.numeroPo) || null;
        this.isLoading = false;
      });
    }
  }

  voltarParaLista() {
    this.voltar.emit();
  }
}
