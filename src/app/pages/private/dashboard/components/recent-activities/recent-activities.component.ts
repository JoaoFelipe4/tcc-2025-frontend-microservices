import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface Activity {
  action: string;
  time: string;
  user?: string;
}

@Component({
  selector: 'app-recent-activities',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.css']
})
export class RecentActivitiesComponent {
  @Input() activities: Activity[] = [];
}