import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-services',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './hr-services.html',
  styleUrl: './hr-services.scss'
})
export class HrServices {

}
