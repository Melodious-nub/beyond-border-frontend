import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banking-finance',
  imports: [BreadcrumbComponent, RouterModule],
  templateUrl: './banking-finance.html',
  styleUrl: './banking-finance.scss'
})
export class BankingFinance {

}
