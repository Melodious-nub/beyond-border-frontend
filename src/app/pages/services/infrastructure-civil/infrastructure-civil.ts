import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-infrastructure-civil',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './infrastructure-civil.html',
  styleUrl: './infrastructure-civil.scss'
})
export class InfrastructureCivil {

}
