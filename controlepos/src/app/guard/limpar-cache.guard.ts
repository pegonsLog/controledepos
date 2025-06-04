import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PoListaComponent } from '../componentes/po-lista/po-lista.component'; // Ajuste o caminho se necessário
import { CacheService } from '../services/cache.service'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class LimparCacheGuard implements CanDeactivate<PoListaComponent> {

  constructor(private cacheService: CacheService, private router: Router) {}

  async canDeactivate(
    component: PoListaComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {

    if (nextState) {
      // Verifica se a próxima rota é a de menu
      if (nextState.url === '/menu') {
        await this.cacheService.limparDadosPesquisa();
        console.log('Cache de pesquisa (IndexedDB) limpo ao sair para o menu.');
      }
      // Não limpa o cache se for para formulários de PO
      else if (nextState.url.startsWith('/formulario-po/') || nextState.url.startsWith('/alterar-po/')) {
        console.log('Mantendo cache ao navegar para formulário PO.');
      }
      // Para outras rotas (como detalhes), também não limpa por padrão, a menos que seja explicitamente o menu
    }
    return true; // Permite a navegação
  }
}
