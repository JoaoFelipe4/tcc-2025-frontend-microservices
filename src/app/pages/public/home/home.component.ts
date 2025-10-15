import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Doctor {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  crm: string;
  specialties: string[];
  consultationDuration: number;
  consultationPrice: number;
  isAcceptingPatients: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  doctors: Doctor[] = [];
  loading: boolean = true;
  error: string = '';

  // 🎯 API CONFIGURATION - SET YOUR BASE URL HERE
  private apiBaseUrl = 'https://tciz3mxmuh.execute-api.us-east-2.amazonaws.com/init/'; // Change this to your API URL

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.error = '';

    // 🎯 API ENDPOINT - Full URL construction
    const apiUrl = `${this.apiBaseUrl}?specialty=Cardiologia&isAcceptingPatients=true&page=1&limit=10`;

    this.http.get<any>(apiUrl)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.doctors = response.doctors;
          } else {
            this.error = 'Erro na resposta da API';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar médicos:', error);
          this.error = 'Não foi possível carregar a lista de médicos';
          this.loading = false;
        }
      });
  }

  schedule(doctor: Doctor) {
    alert(`Agendamento com Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
    // Add your scheduling logic here
  }
}