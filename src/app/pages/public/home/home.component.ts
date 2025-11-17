import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

interface ApiResponse {
  success: boolean;
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  doctors: Doctor[] = [];
  displayedDoctors: Doctor[] = [];
  loading: boolean = true;
  error: string = '';

  // Filter properties
  selectedSpecialty: string = '';
  availabilityFilter: string = 'all';
  searchTerm: string = '';
  specialties: string[] = [];

  // Pagination properties
  currentPage: number = 1;
  limit: number = 20;
  totalDoctors: number = 0;
  totalPages: number = 0;

  // Search debounce
  private searchTimeout: any;

  // API configuration
  private apiBaseUrl = 'https://ewidx5waq3.execute-api.us-east-2.amazonaws.com/api/doctors';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.error = '';

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.limit.toString());

    // Add specialty filter if selected
    if (this.selectedSpecialty) {
      params = params.set('specialty', this.selectedSpecialty);
    }

    // Add availability filter if selected
    if (this.availabilityFilter !== 'all') {
      params = params.set('isAcceptingPatients', this.availabilityFilter);
    }

    this.http.get<ApiResponse>(this.apiBaseUrl, { params })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.doctors = response.doctors;
            this.displayedDoctors = [...this.doctors];
            this.totalDoctors = response.total;
            this.totalPages = response.totalPages;
            this.currentPage = response.page;
            
            // Apply search filter if there's a search term
            if (this.searchTerm) {
              this.filterDoctorsByName();
            }
            
            // Extract specialties from the first load or when no filters are applied
            if (this.specialties.length === 0 && response.doctors.length > 0) {
              this.extractSpecialties();
            }
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

  extractSpecialties() {
    // This would ideally come from a separate API endpoint for specialties
    // For now, we'll extract from the first batch of doctors
    const allSpecialties = this.doctors.flatMap(doctor => doctor.specialties);
    this.specialties = [...new Set(allSpecialties)].sort();
  }

  applyFilters() {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadDoctors();
  }

  onSearchChange() {
    // Debounce the search to avoid too many operations
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filterDoctorsByName();
    }, 300);
  }

  filterDoctorsByName() {
    if (!this.searchTerm) {
      this.displayedDoctors = [...this.doctors];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.displayedDoctors = this.doctors.filter(doctor => {
      const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
      return fullName.includes(searchTermLower);
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.displayedDoctors = [...this.doctors];
  }

  clearFilters() {
    this.selectedSpecialty = '';
    this.availabilityFilter = 'all';
    this.searchTerm = '';
    this.currentPage = 1;
    this.limit = 10;
    this.loadDoctors();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDoctors();
    }
  }

  schedule(doctor: Doctor) {
    alert(`Agendamento com Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
    // Add your scheduling logic here
  }
}