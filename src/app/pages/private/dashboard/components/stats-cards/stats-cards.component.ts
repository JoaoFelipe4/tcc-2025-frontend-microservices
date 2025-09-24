import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down';
}

@Component({
  selector: 'app-stats-cards',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent {
  @Input() stats: StatCard[] = [];
}