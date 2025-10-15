import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule // Add this for standalone component
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Using inject() - Angular 14+ way
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Form data
  credentials = {
    email: '',
    password: ''
  };
  
  // UI state
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // API configuration - adjust this to your backend
  private apiUrl = 'https://tciz3mxmuh.execute-api.us-east-2.amazonaws.com/init'; // Change to your backend URL
  
  // Main login method - async/await pattern for Vite
  async login(): Promise<void> {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validate
    if (!this.validateForm()) {
      return;
    }
    
    // Start loading
    this.isLoading = true;
    
    try {
      // Make API call using firstValueFrom for async/await
      const response = await firstValueFrom(
        this.http.post<any>(this.apiUrl, {
          email: this.credentials.email.trim().toLowerCase(),
          password: this.credentials.password
        })
      );
      
      // Handle success
      this.handleLoginSuccess(response);
      
    } catch (error: any) {
      // Handle error
      this.handleLoginError(error);
    } finally {
      // Stop loading
      this.isLoading = false;
    }
  }
  
  // Alternative: Using subscribe (if async/await doesn't work)
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
  
  // Form validation
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
  
  // Handle successful login
  private handleLoginSuccess(response: any): void {
    if (!response.success) {
      this.errorMessage = 'Resposta inválida do servidor.';
      return;
    }
    
    // Save token
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', response.token);
      
      // Save user data
      const userData = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role
      };
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Show success
      this.successMessage = 'Login realizado com sucesso! Redirecionando...';
      
      // Navigate after delay
      setTimeout(() => {
        const targetRoute = this.getRouteByRole(userData.role);
        this.router.navigate([targetRoute]);
      }, 1000);
    }
  }
  
  // Get route based on user role
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
  
  // Handle login error
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
  
  // Form submit
  onSubmit(): void {
    // Use the subscribe version for better compatibility
    this.loginWithSubscribe();
  }
  
  // Quick test logins
  quickLogin(type: 'patient' | 'doctor'): void {
    if (type === 'patient') {
      this.credentials.email = 'patient@test.com';
      this.credentials.password = 'Test123!';
    } else {
      this.credentials.email = 'doctor@test.com';
      this.credentials.password = 'Test123!';
    }
    this.loginWithSubscribe();
  }
}