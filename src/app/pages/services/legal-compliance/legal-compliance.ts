import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-legal-compliance',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './legal-compliance.html',
  styleUrl: './legal-compliance.scss'
})
export class LegalCompliance {

}
