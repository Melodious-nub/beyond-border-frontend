import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ngo-technical',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './ngo-technical.html',
  styleUrl: './ngo-technical.scss'
})
export class NgoTechnical {

}
