import { Component } from '@angular/core';
import { BreadcrumbComponent } from "../../shared/components/breadcrumb/breadcrumb";
import { ConsultationRequestComponent } from "../../shared/components/consultation-request/consultation-request";

@Component({
  selector: 'app-contact',
  imports: [BreadcrumbComponent, ConsultationRequestComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {

}
