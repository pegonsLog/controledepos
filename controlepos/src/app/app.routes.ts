import { Routes } from '@angular/router';

import { PoFormComponent } from './componentes/po-form/po-form.component';

import { PoListaComponent } from './componentes/po-lista/po-lista.component';
import { PoDetalhesComponent } from './componentes/po-detalhes/po-detalhes.component';
import { PdfListComponent } from './componentes/pdf-list/pdf-list.component';
import { MenuComponent } from './componentes/menu/menu.component';
import { LoginComponent } from './componentes/login/login.component'; // Importar LoginComponent
import { authGuard } from './guard/guard'; // Importar authGuard
import { PoFormAlterarComponent } from './componentes/po-form-alterar/po-form-alterar.component';
import { LimparCacheGuard } from './guard/limpar-cache.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent }, // Rota de Login
  {
    path: 'menu',
    component: MenuComponent,
    canActivate: [authGuard] // Proteger a rota do menu
  },
  {
    path: 'formulario-po/:sheetName',
    component: PoFormComponent,
    canActivate: [authGuard] // Proteger
  },
  {
    path: 'alterar-po/:sheetName/:numero_po',
    component: PoFormAlterarComponent,
    canActivate: [authGuard] // Proteger
  },
  {
    path: 'po/detalhes/:sheetName/:numero_po',
    component: PoDetalhesComponent,
    canActivate: [authGuard] // Proteger
  },
  {
    path: 'po-lista/:sheetName', // Alterado de 'lista-pos' para 'po-lista' para consistência com o LoginComponent
    component: PoListaComponent,
    canActivate: [authGuard], // Proteger
    canDeactivate: [LimparCacheGuard] // Limpar cache ao sair para o menu
  },
  {
    path: 'pdfs/:folderIdentifier',
    component: PdfListComponent,
    canActivate: [authGuard] // Proteger
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Rota curinga para redirecionar para o login
];
