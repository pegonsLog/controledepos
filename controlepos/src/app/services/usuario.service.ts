import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Usuario } from '../modelos/usuario';
import { GoogleSheetsService } from './google-sheets.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;
  private readonly USER_STORAGE_KEY = 'currentUser';

  constructor(
    private googleSheetsService: GoogleSheetsService,
    private router: Router
  ) {
    // Tenta carregar o usuário do localStorage ao iniciar o serviço
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(usuario: string, senha: string): Observable<Usuario | null> {
    return this.googleSheetsService.getUsuarios().pipe(
      map(usuarios => {
        const userFound = usuarios.find(u => u.usuario === usuario && u.senha === senha);
        if (userFound) {
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userFound));
          this.currentUserSubject.next(userFound);
          return userFound;
        }
        return null; // Usuário não encontrado ou senha incorreta
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']); // Redireciona para a tela de login
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return !!this.currentUserValue && this.currentUserValue.perfil === 'adm';
  }

  // Pode ser útil para obter o nome do usuário para exibir na interface
  getCurrentUserName(): string | null {
    return this.currentUserValue ? this.currentUserValue.nome : null;
  }
}
