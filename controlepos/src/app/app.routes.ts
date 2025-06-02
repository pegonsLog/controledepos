import { Routes } from '@angular/router';

import { PoFormComponent } from './componentes/po-form/po-form.component';
import { PoListaComponent } from './componentes/po-lista/po-lista.component';
import { PoDetalhesComponent } from './componentes/po-detalhes/po-detalhes.component';
import { PdfListComponent } from './componentes/pdf-list/pdf-list.component';
import { MenuComponent } from './componentes/menu/menu.component';

export const routes: Routes = [
  // { path: '', component: PoListaComponent }, 
  { path: 'novo-po', component: PoFormComponent }, 
  { path: 'po/editar/:numero_po', component: PoFormComponent }, 
  { path: 'po/detalhes/:numero_po', component: PoDetalhesComponent }, 
  { path: 'lista-pos', component: PoListaComponent },
  { path: 'pdfs', component: PdfListComponent },
  { path: 'menu', component: MenuComponent },
  { path: '', component: MenuComponent }
];
