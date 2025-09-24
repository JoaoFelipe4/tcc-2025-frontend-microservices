import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
    standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulação de delay de rede
    setTimeout(() => {
      if (this.authService.login(this.credentials.email, this.credentials.password)) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
      }
      this.isLoading = false;
    }, 1000);
  }
}