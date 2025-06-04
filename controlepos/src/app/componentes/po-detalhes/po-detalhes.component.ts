import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  po: Po | undefined;
  isLoading = true;
  currentSheetName: string | null = null; // Para armazenar o nome da aba
  numeroPo: string | null = null; // Para armazenar o numero_po da rota

  constructor(
    private poService: PoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(params => {
      const sheetNameParam = params.get('sheetName');
      const numeroPo = params.get('numero_po');
      this.isLoading = true;

      if (sheetNameParam) {
        this.currentSheetName = sheetNameParam;
      } else {
        console.error('SheetName não fornecido na rota para detalhes do PO.');
        this.isLoading = false;
        // Idealmente, redirecionar ou mostrar erro, pois sem sheetName não podemos buscar
        // this.router.navigate(['/menu']); // Exemplo
        return;
      }

      if (numeroPo && this.currentSheetName) {
        this.poService.listar(this.currentSheetName).subscribe(todosOsPos => {
          this.po = todosOsPos.find(p => p.numero_po === numeroPo);
          this.isLoading = false;
          if (!this.po) {
            console.error(`PO com número ${numeroPo} não encontrado na aba ${this.currentSheetName}.`);
          } else {
            console.log('Dados do PO carregado:', JSON.stringify(this.po)); // Log para depuração
          }
          // this.router.navigate(['/lista-pos', this.currentSheetName]);
        }, error => {
          console.error('Erro ao buscar POs:', error);
          this.isLoading = false;
        });
      } else {
        if (!numeroPo) console.error('Número do PO não fornecido na rota.');
        this.isLoading = false;
        // this.router.navigate(['/lista-pos', this.currentSheetName || 'Oeste']); // Fallback ou erro
      }
    });
  }

  voltarParaLista(): void {
    if (this.currentSheetName) {
      this.router.navigate(['/po-lista', this.currentSheetName]);
    } else {
      // Fallback se currentSheetName não estiver definido, embora não devesse acontecer
      console.warn('currentSheetName não definido ao voltar para lista, usando rota padrão.');
      this.router.navigate(['/po-lista', 'Oeste']); // Ou para /menu ou uma rota de erro mais genérica
    }
  }
}
