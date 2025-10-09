import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-green-design',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './green-design.html',
  styleUrl: './green-design.scss'
})
export class GreenDesign {

}
