import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agricultural-innovation',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './agricultural-innovation.html',
  styleUrl: './agricultural-innovation.scss'
})
export class AgriculturalInnovation {

}
