import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TermsAndConditionModal } from '../terms-and-condition-modal/terms-and-condition-modal';
import { PrivacyPolicyModal } from '../privacy-policy-modal/privacy-policy-modal';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, MatButtonModule, MatDialogModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  readonly dialog = inject(MatDialog);

  openDialogTermsAndCondition() {
    const dialogRef = this.dialog.open(TermsAndConditionModal, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogPrivacyPolicy() {
    const dialogRef = this.dialog.open(PrivacyPolicyModal, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
