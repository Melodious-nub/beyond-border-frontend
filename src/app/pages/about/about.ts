import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';
import { TeamData } from "../../shared/components/team-data/team-data";
import { AboutData } from "../../shared/components/about-data/about-data";

@Component({
  selector: 'app-about',
  imports: [BreadcrumbComponent, RouterModule, TeamData, AboutData],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
