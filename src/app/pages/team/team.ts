import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-team',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './team.html',
  styleUrl: './team.scss'
})
export class Team {

}
