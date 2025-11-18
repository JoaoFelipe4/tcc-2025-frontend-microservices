// src/app/pages/public/register/register.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Tipo de usuário selecionado
  userType: 'patient' | 'doctor' = 'patient';
  
  // Dados comuns
  formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'patient'
  };
  
  // Dados específicos do paciente
  patientData = {
    cpf: '',
    dateOfBirth: '',
    bloodType: ''
  };
  
  // Dados específicos do médico
  doctorData = {
    crm: '',
    specialties: [] as string[],
    consultationPrice: null as number | null,
    consultationDuration: null as number | null
  };
  
  // Controle de especialidades
  newSpecialty = '';
  
  // Outros controles
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = 'https://dibx20qa50.execute-api.us-east-2.amazonaws.com/api/auth/register';
  
  setUserType(type: 'patient' | 'doctor'): void {
    this.userType = type;
    this.formData.role = type;
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  formatCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    // Aplica a formatação
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    }
    
    this.patientData.cpf = value;
  }
  
  addSpecialty(): void {
    if (this.newSpecialty.trim()) {
      const specialty = this.newSpecialty.trim();
      if (!this.doctorData.specialties.includes(specialty)) {
        this.doctorData.specialties.push(specialty);
      }
      this.newSpecialty = '';
    }
  }
  
  removeSpecialty(index: number): void {
    this.doctorData.specialties.splice(index, 1);
  }
  
  isFormValid(): boolean {
    // Validações básicas
    if (!this.formData.firstName || !this.formData.lastName || 
        !this.formData.email || !this.formData.password || 
        !this.formData.phone) {
      return false;
    }
    
    // Verifica se as senhas coincidem
    if (this.formData.password !== this.confirmPassword) {
      return false;
    }
    
    // Verifica se a senha tem pelo menos 6 caracteres
    if (this.formData.password.length < 6) {
      return false;
    }
    
    // Validações específicas do paciente
    if (this.userType === 'patient') {
      if (!this.patientData.cpf || !this.patientData.dateOfBirth || 
          !this.patientData.bloodType) {
        return false;
      }
      
      // Valida CPF (apenas verifica se tem 11 dígitos)
      const cpfNumbers = this.patientData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        return false;
      }
    }
    
    // Validações específicas do médico
    if (this.userType === 'doctor') {
      if (!this.doctorData.crm || 
          this.doctorData.specialties.length === 0 ||
          !this.doctorData.consultationPrice || 
          !this.doctorData.consultationDuration) {
        return false;
      }
    }
    
    return true;
  }
  
  private prepareRegistrationData(): any {
    const baseData = {
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      phone: this.formData.phone.trim(),
      role: this.formData.role
    };
    
    if (this.userType === 'patient') {
      return {
        ...baseData,
        cpf: this.patientData.cpf.replace(/\D/g, ''), // Remove formatação
        dateOfBirth: this.patientData.dateOfBirth,
        bloodType: this.patientData.bloodType
      };
    } else {
      return {
        ...baseData,
        crm: this.doctorData.crm.trim(),
        specialties: this.doctorData.specialties,
        consultationPrice: Number(this.doctorData.consultationPrice),
        consultationDuration: Number(this.doctorData.consultationDuration)
      };
    }
  }
  
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      return;
    }
    
    this.isLoading = true;
    
    const registrationData = this.prepareRegistrationData();
    
    this.http.post<any>(this.apiUrl, registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.handleRegistrationSuccess(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }
  
  private handleRegistrationSuccess(response: any): void {
    this.successMessage = 'Conta criada com sucesso! Redirecionando para o login...';
    
    // Limpa o formulário
    this.resetForm();
    
    // Redireciona para o login após 2 segundos
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
  
  private handleRegistrationError(error: any): void {
    console.error('Registration error:', error);
    
    if (error.status === 409) {
      this.errorMessage = 'Este email já está cadastrado.';
    } else if (error.status === 400) {
      this.errorMessage = error.error?.message || 'Dados inválidos. Verifique as informações.';
    } else if (error.status === 0) {
      this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    } else if (error.status === 500) {
      this.errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
    } else {
      this.errorMessage = error.error?.message || 'Erro ao criar conta. Tente novamente.';
    }
  }
  
  private resetForm(): void {
    this.formData = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'patient'
    };
    
    this.patientData = {
      cpf: '',
      dateOfBirth: '',
      bloodType: ''
    };
    
    this.doctorData = {
      crm: '',
      specialties: [],
      consultationPrice: null,
      consultationDuration: null
    };
    
    this.confirmPassword = '';
    this.newSpecialty = '';
  }
}