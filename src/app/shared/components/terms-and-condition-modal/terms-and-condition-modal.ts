import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-terms-and-condition-modal',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './terms-and-condition-modal.html',
  styleUrl: './terms-and-condition-modal.scss'
})
export class TermsAndConditionModal {
  
}
