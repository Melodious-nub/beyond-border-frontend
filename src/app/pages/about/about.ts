import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
