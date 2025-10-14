// header.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isAuthenticated = false;
  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    console.log('HeaderComponent: Constructor called');
  }

  ngOnInit(): void {
    console.log('HeaderComponent: ngOnInit called');
    
    // Set initial state
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    console.log('HeaderComponent: Initial state - authenticated:', this.isAuthenticated, 'user:', this.currentUser);

    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        console.log('HeaderComponent: User state changed:', user);
        this.currentUser = user;
        this.isAuthenticated = !!user;
        console.log('HeaderComponent: Updated state - authenticated:', this.isAuthenticated, 'user:', this.currentUser);
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('HeaderComponent: Error in user subscription:', error);
      }
    });
  }

  logout(): void {
    console.log('HeaderComponent: Logout initiated');
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('HeaderComponent: Subscription cleaned up');
    }
  }

  // Manual refresh method for debugging
  refreshAuthState(): void {
    console.log('HeaderComponent: Manual refresh triggered');
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.cdr.detectChanges();
  }
}