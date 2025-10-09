import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-health-systems',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './health-systems.html',
  styleUrl: './health-systems.scss'
})
export class HealthSystems {

}
