// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'https://tciz3mxmuh.execute-api.us-east-2.amazonaws.com/';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');
      
      if (userData && token) {
        console.log('Initializing auth state from localStorage:', JSON.parse(userData));
        this.currentUserSubject.next(JSON.parse(userData));
      } else {
        console.log('No auth data found in localStorage');
        this.currentUserSubject.next(null);
      }
    }
  }
  
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('AuthService: Login attempt for:', email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('AuthService: Login response:', response);
        if (response.success && typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          console.log('AuthService: Setting current user to:', response.user);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }
  
  logout(): void {
    console.log('AuthService: Logging out');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }
  
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
  
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Helper method to manually trigger state check
  checkAuthState(): void {
    this.initializeAuthState();
  }
}