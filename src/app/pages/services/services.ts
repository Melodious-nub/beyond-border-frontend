import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services {

}
