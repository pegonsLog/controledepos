import { Routes } from '@angular/router';

import { PoFormComponent } from './componentes/po-form/po-form.component';
import { PoListaComponent } from './componentes/po-lista/po-lista.component';
import { PoDetalhesComponent } from './componentes/po-detalhes/po-detalhes.component';

export const routes: Routes = [
  { path: '', component: PoListaComponent }, 
  { path: 'novo-po', component: PoFormComponent }, 
  { path: 'po/editar/:numero_po', component: PoFormComponent }, 
  { path: 'po/detalhes/:numero_po', component: PoDetalhesComponent }, 
  { path: 'lista-pos', component: PoListaComponent }
];
