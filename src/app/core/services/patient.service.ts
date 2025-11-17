import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://ewidx5waq3.execute-api.us-east-2.amazonaws.com/api/patients'; // Adjust to your API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPatientProfile(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profileId) {
      throw new Error('No authenticated user found');
    }
    
    const headers = this.createAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/${currentUser.profileId}`, { headers });
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}