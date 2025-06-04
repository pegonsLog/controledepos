import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { Router, RouterLink } from '@angular/router'; // Importar Router
import { UsuarioService } from '../../services/usuario.service'; // Importar UsuarioService

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatButtonModule, // Adicione MatButtonModule aos imports
    RouterLink       // Adicione RouterLink se os botões forem navegar
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  logout(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']);
  }
}