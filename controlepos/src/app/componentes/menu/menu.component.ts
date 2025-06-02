import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { RouterLink } from '@angular/router'; // Import RouterLink se for usar para navegação

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
  // Nenhuma lógica complexa necessária por enquanto
  constructor() { }
}