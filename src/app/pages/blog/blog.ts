import { Component } from '@angular/core';
import { BreadcrumbComponent } from "../../shared/components/breadcrumb/breadcrumb";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog {

}
