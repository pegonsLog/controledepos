import { Routes } from '@angular/router';

import { MenuComponent } from './componentes/menu/menu.component';
import { PoFormComponent } from './componentes/po-form/po-form.component';
import { PoListaComponent } from './componentes/po-lista/po-lista.component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'novo-po', component: PoFormComponent }, // Rota para criar novo PO
  { path: 'po/editar/:numero_do_po', component: PoFormComponent }, // Rota para editar PO existente
  { path: 'lista-pos', component: PoListaComponent }
];
