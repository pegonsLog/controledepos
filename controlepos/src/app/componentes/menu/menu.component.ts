import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Po } from '../../modelos/po';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})

export class MenuComponent {
  constructor(private router: Router) {}

  abrirFormulario() {
    this.router.navigate(['/novo-po']);
  }

  consultarPos() {
    this.router.navigate(['/lista-pos']);
  }

  fecharFormulario() {
    // this.mostrarFormulario = false;
    // this.router.navigate(['/']);
  }

  salvarPo(po: Po) {
    // Aqui você pode chamar um serviço para salvar o PO
    // this.fecharFormulario();
    console.log('Po salvo (do MenuComponent):', po);
  }
}
