import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-microcredit',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './microcredit.html',
  styleUrl: './microcredit.scss'
})
export class Microcredit {

}
