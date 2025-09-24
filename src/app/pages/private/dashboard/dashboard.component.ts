import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  currentUser: User | null = null;
  stats = [
    { title: 'Total de Usuários', value: 1243, icon: '👥' },
    { title: 'Vendas do Mês', value: 'R$ 42.567', icon: '💰' },
    { title: 'Novos Pedidos', value: 56, icon: '📦' },
    { title: 'Taxa de Conversão', value: '23.4%', icon: '📊' }
  ];

  recentActivities = [
    { action: 'Novo usuário registrado', time: '2 minutos atrás' },
    { action: 'Pedido #1234 concluído', time: '1 hora atrás' },
    { action: 'Relatório mensal gerado', time: '3 horas atrás' },
    { action: 'Atualização do sistema', time: '1 dia atrás' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}