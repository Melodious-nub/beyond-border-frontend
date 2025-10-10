import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';
import { TeamData } from "../../shared/components/team-data/team-data";

@Component({
  selector: 'app-team',
  imports: [BreadcrumbComponent, RouterModule, TeamData],
  templateUrl: './team.html',
  styleUrl: './team.scss'
})
export class Team {

}
