import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor(private router: Router) {}

  isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

login(email: string, password: string): boolean {
  if (email === 'admin@email.com' && password === '123456') {
    const user: User = {
      id: 1,
      name: 'Administrador',
      email: email
    };
    
    if (this.isBrowser()) {
      localStorage.setItem(this.AUTH_KEY, 'fake-jwt-token');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    return true;
  }
  return false;
}

logout(): void {
  if (this.isBrowser()) {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
  this.router.navigate(['/login']);
}

isAuthenticated(): boolean {
  if (!this.isBrowser()) return false;
  return !!localStorage.getItem(this.AUTH_KEY);
}

getCurrentUser(): User | null {
  if (!this.isBrowser()) return null;
  const userStr = localStorage.getItem(this.USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}
}