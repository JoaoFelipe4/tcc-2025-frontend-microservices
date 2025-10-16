import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  patientData: any = null;
  
  stats = [
    { title: 'Medicações Ativas', value: 0, icon: '💊', loading: true },
    { title: 'Condições Médicas', value: 0, icon: '🩺', loading: true },
    { title: 'Alergias', value: 0, icon: '⚠️', loading: true },
    { title: 'Status do Seguro', value: 'Carregando...', icon: '📄', loading: true }
  ];

  recentActivities: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadPatientData();
    } else {
      this.error = 'Usuário não autenticado';
      this.isLoading = false;
    }
  }

  loadPatientData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.patientService.getPatientProfile().subscribe({
      next: (response) => {
        if (response.success && response.patient) {
          this.patientData = response.patient;
          this.updateDashboardData();
        } else {
          this.error = 'Dados do paciente não encontrados';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.error = 'Erro ao carregar dados do paciente';
        this.isLoading = false;
      }
    });
  }

  private updateDashboardData(): void {
    // Update stats
    this.stats[0].value = this.patientData.medications?.length || 0;
    this.stats[0].loading = false;
    
    this.stats[1].value = this.patientData.medicalHistory?.length || 0;
    this.stats[1].loading = false;
    
    this.stats[2].value = this.patientData.allergies?.length || 0;
    this.stats[2].loading = false;
    
    this.stats[3].value = this.getInsuranceStatus();
    this.stats[3].loading = false;

    // Update recent activities from medical history
    this.updateRecentActivities();
  }

  // Changed from private to public
  getInsuranceStatus(): string {
    if (!this.patientData?.insuranceInfo) return 'Não informado';
    
    const validUntil = new Date(this.patientData.insuranceInfo.validUntil);
    const today = new Date();
    
    if (validUntil < today) {
      return 'Expirado';
    } else {
      return 'Ativo';
    }
  }

  private updateRecentActivities(): void {
    const activities = [];
    
    // Add medical history as activities (most recent first)
    if (this.patientData.medicalHistory) {
      // Sort by diagnosis date (most recent first)
      const sortedHistory = [...this.patientData.medicalHistory].sort((a, b) => 
        new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime()
      );
      
      sortedHistory.forEach((history: any) => {
        activities.push({
          action: `Diagnóstico: ${history.condition}`,
          time: this.formatTimeAgo(history.diagnosisDate)
        });
      });
    }
    
    // Add medication count if we have medications
    if (this.patientData.medications && this.patientData.medications.length > 0) {
      activities.unshift({
        action: `${this.patientData.medications.length} medicação(ões) ativa(s)`,
        time: 'Atualizado recentemente'
      });
    }
    
    // Add allergies count if we have allergies
    if (this.patientData.allergies && this.patientData.allergies.length > 0) {
      activities.unshift({
        action: `${this.patientData.allergies.length} alergia(s) registrada(s)`,
        time: 'Atualizado recentemente'
      });
    }
    
    // Take latest 4 activities
    this.recentActivities = activities.slice(0, 4);
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 30) return `${diffDays} dias atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
  }

  getAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Fixed the parameter name from dateOfBirth to dateString
  formatDate(dateString: string): string {
    if (!dateString) return 'Não informada';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  // Quick actions methods
  viewMedications(): void {
    // Navigate to medications page
    console.log('Navigate to medications');
  }

  viewMedicalHistory(): void {
    // Navigate to medical history page
    console.log('Navigate to medical history');
  }

  updateProfile(): void {
    // Navigate to profile update page
    console.log('Navigate to profile update');
  }

  contactEmergency(): void {
    // Contact emergency contact
    if (this.patientData?.emergencyContact) {
      const phone = this.patientData.emergencyContact.phone;
      console.log('Contacting emergency:', phone);
      // You could implement actual calling functionality here
    }
  }

  reloadData(): void {
    this.loadPatientData();
  }
}