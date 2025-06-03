import { Routes } from '@angular/router';

import { PoFormComponent } from './componentes/po-form/po-form.component';
import { PoFormAlterarComponent } from './po-form-alterar/po-form-alterar.component';
import { PoListaComponent } from './componentes/po-lista/po-lista.component';
import { PoDetalhesComponent } from './componentes/po-detalhes/po-detalhes.component';
import { PdfListComponent } from './componentes/pdf-list/pdf-list.component';
import { MenuComponent } from './componentes/menu/menu.component';

export const routes: Routes = [
  // { path: '', component: PoListaComponent }, 
  { path: 'formulario-po/:sheetName', component: PoFormComponent }, // Para novo PO
  { path: 'alterar-po/:sheetName/:numero_po', component: PoFormAlterarComponent }, // Para editar PO
  { path: 'po/detalhes/:sheetName/:numero_po', component: PoDetalhesComponent }, 
  { path: 'lista-pos/:sheetName', component: PoListaComponent },
  { path: 'pdfs/:folderIdentifier', component: PdfListComponent },
  { path: 'menu', component: MenuComponent },
  { path: '', component: MenuComponent } // Rota padrão para o menu
];
