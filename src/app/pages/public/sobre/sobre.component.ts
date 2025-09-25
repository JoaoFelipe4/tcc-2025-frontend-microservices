// src/app/pages/public/sobre/sobre.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
}

@Component({
  selector: 'app-sobre',
  standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './sobre.component.html',
  styleUrls: ['./sobre.component.css']
})
export class SobreComponent {
  teamMembers: TeamMember[] = [
    { name: 'Elma Maria', role: 'Desenvolvedor Frontend' },
    { name: 'Samara Angela', role: 'UX Designer' },
    { name: 'Deide Costa', role: 'Backend Developer' }
  ];
}