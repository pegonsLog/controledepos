import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Po } from '../../modelos/po';
import { PoService } from '../../services/po.service';
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
  po: Po | undefined;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private poService: PoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const numeroPoParam = this.route.snapshot.paramMap.get('numero_po');
    if (numeroPoParam) {
      this.carregarPo(numeroPoParam);
    } else {
      console.error('Número do PO não fornecido na rota.');
      this.router.navigate(['/lista-pos']);
    }
  }

  async carregarPo(numeroPo: string): Promise<void> {
    this.isLoading = true;
    try {
      const poEncontrado = await this.poService.getPo(numeroPo);
      if (poEncontrado) {
        this.po = poEncontrado;
      } else {
        console.warn(`PO com número ${numeroPo} não encontrado.`);
        this.router.navigate(['/lista-pos']);
      }
    } catch (error) {
      console.error(`Erro ao carregar PO ${numeroPo}:`, error);
      this.router.navigate(['/lista-pos']);
    } finally {
      this.isLoading = false;
    }
  }

  voltarParaLista(): void {
    this.router.navigate(['/lista-pos']);
  }

  editarPo(): void {
    if (this.po && this.po.numero_po) {
      this.router.navigate(['/po/editar', this.po.numero_po]);
    } else {
      console.error('Não é possível editar: número do PO não definido.');
    }
  }
}
