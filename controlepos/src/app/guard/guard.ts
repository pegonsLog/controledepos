import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service'; // Caminho corrigido

export const authGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  if (usuarioService.isLoggedIn()) {
    // Usuário está logado, então permite o acesso à rota
    return true;
  }

  // Usuário não está logado, redireciona para a página de login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};