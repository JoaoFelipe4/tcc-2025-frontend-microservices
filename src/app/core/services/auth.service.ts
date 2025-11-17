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
    profileId: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Fixed: Removed trailing slash to avoid double slashes in URL
  private apiUrl = 'https://ewidx5waq3.execute-api.us-east-2.amazonaws.com';
  
  // Fixed: Properly typed BehaviorSubject
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');
      
      if (userData && token) {
        try {
          this.currentUserSubject.next(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          this.clearAuthData();
        }
      } else {
        this.currentUserSubject.next(null);
      }
    }
  }
  
  // Fixed: This method should be used by login component
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.handleLoginSuccess(response);
        }
      })
    );
  }

  // Fixed: Separate method to handle successful login
  private handleLoginSuccess(response: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }

  // Fixed: Manual login method for when login happens outside this service
  setUser(user: User, token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
  
  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }
  
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }
  
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Helper method to manually trigger state check
  checkAuthState(): void {
    this.initializeAuthState();
  }
}