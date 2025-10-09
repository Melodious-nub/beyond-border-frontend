import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administrative-regulatory',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './administrative-regulatory.html',
  styleUrl: './administrative-regulatory.scss'
})
export class AdministrativeRegulatory {

}
