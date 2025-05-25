import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// PoForm2Component import removida

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'controlepos';
}
