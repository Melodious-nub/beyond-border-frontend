import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recruitment',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './recruitment.html',
  styleUrl: './recruitment.scss'
})
export class Recruitment {

}
