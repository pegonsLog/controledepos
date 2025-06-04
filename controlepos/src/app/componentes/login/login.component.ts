import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { UsuarioService } from '../../services/usuario.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; // Para ngIf, etc.
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Corrigido para styleUrls
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/menu'; // Rota padrão após login

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute, // Injetar ActivatedRoute
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required]
    });

    // Se já estiver logado, redireciona para a returnUrl ou /menu
    if (this.usuarioService.isLoggedIn()) {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/menu';
      this.router.navigate([this.returnUrl]);
    } else {
      // Obtém a returnUrl dos queryParams da rota atual, se existir
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/menu';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Por favor, preencha usuário e senha.', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading = true;
    const { usuario, senha } = this.loginForm.value;

    this.usuarioService.login(usuario!, senha!).subscribe({
      next: (user) => {
        this.loading = false;
        if (user) {
          // Navega para a returnUrl (que pode ser a página que o usuário tentou acessar
          // antes do login, ou /menu como padrão)
          this.router.navigate([this.returnUrl]);
        } else {
          this.snackBar.open('Usuário ou senha inválidos.', 'Fechar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Erro ao tentar fazer login. Tente novamente.', 'Fechar', { duration: 3000 });
        console.error('Login error:', err);
      }
    });
  }
}
