import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService); // Inject AuthService
  
  credentials = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = 'https://dibx20qa50.execute-api.us-east-2.amazonaws.com/api/auth/login';
  
  loginWithSubscribe(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    
    const loginData = {
      email: this.credentials.email.trim().toLowerCase(),
      password: this.credentials.password
    };
    
    this.http.post<any>(this.apiUrl, loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }
  
  private validateForm(): boolean {
    if (!this.credentials.email) {
      this.errorMessage = 'Por favor, insira seu email.';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return false;
    }
    
    if (!this.credentials.password) {
      this.errorMessage = 'Por favor, insira sua senha.';
      return false;
    }
    
    if (this.credentials.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return false;
    }
    
    return true;
  }
  
  private handleLoginSuccess(response: any): void {
    if (!response.success) {
      this.errorMessage = 'Resposta inválida do servidor.';
      return;
    }
    
    // FIXED: Use AuthService to set user data - this will update the header
    const userData = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      role: response.user.role,
      profileId: response.user.profileId
    };
    
    // This is the key line that fixes the header update issue
    this.authService.setUser(userData, response.token);
    
    this.successMessage = 'Login realizado com sucesso! Redirecionando...';
    
    setTimeout(() => {
      const targetRoute = this.getRouteByRole(userData.role);
      this.router.navigate([targetRoute]);
    }, 1000);
  }
  
  private getRouteByRole(role: string): string {
    switch (role) {
      case 'admin':
        return '/dashboard';
      case 'doctor':
        return '/dashboard';
      case 'patient':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }
  
  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    
    if (error.status === 401) {
      this.errorMessage = 'Email ou senha incorretos.';
    } else if (error.status === 0) {
      this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    } else if (error.status === 500) {
      this.errorMessage = 'Erro no servidor. Tente novamente.';
    } else {
      this.errorMessage = error.error?.message || 'Erro ao fazer login.';
    }
  }
  
  onSubmit(): void {
    this.loginWithSubscribe();
  }
}