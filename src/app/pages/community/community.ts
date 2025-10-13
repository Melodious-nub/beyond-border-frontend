import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbComponent } from "../../shared/components/breadcrumb/breadcrumb";
import { TermsAndConditionModal } from "../../shared/components/terms-and-condition-modal/terms-and-condition-modal";
import { ApiService } from '../../../core/api';
import Swal from 'sweetalert2';

export interface CommunityFormData {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  linkedInProfile?: string;
  company: string;
  designation: string;
  yearsOfExperience: number;
  areasOfExpertise: string[];
  whyJoinCommunity: string;
  howCanContribute: string;
  email: boolean;
  whatsapp: boolean;
  slack: boolean;
  openToMentoring: boolean;
  agreement: boolean;
}

export interface ExpertiseOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-community',
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  formData: CommunityFormData = {
    name: '',
    emailAddress: '',
    phoneNumber: '',
    linkedInProfile: '',
    company: '',
    designation: '',
    yearsOfExperience: 0,
    areasOfExpertise: [],
    whyJoinCommunity: '',
    howCanContribute: '',
    email: false,
    whatsapp: false,
    slack: false,
    openToMentoring: false,
    agreement: false
  };

  isSubmitting = false;
  otherExpertise = '';
  customExpertise: string[] = [];

  // Areas of expertise options based on the image
  expertiseOptions: ExpertiseOption[] = [
    { value: 'Microcredit & Financial Inclusion', label: 'Microcredit & Financial Inclusion' },
    { value: 'Technical Service Provider', label: 'Technical Service Provider' },
    { value: 'Recruitment Support', label: 'Recruitment Support' },
    { value: 'Health Systems Strengthening', label: 'Health Systems Strengthening' },
    { value: 'Banking & Finance Advisory', label: 'Banking & Finance Advisory' },
    { value: 'Administrative & Regulatory Due Diligence', label: 'Administrative & Regulatory Due Diligence' },
    { value: 'Infrastructure & Civil Engineering', label: 'Infrastructure & Civil Engineering' },
    { value: 'Legal & Compliance Services', label: 'Legal & Compliance Services' },
    { value: 'Agricultural Innovation', label: 'Agricultural Innovation' },
    { value: 'Technology & Digital Transformation', label: 'Technology & Digital Transformation' },
    { value: 'Others', label: 'Others (please specify)' }
  ];

  toggleExpertise(expertise: string, event: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      if (!this.formData.areasOfExpertise.includes(expertise)) {
        this.formData.areasOfExpertise.push(expertise);
      }
    } else {
      this.formData.areasOfExpertise = this.formData.areasOfExpertise.filter(item => item !== expertise);
      
      // If "Others" is unchecked, clear custom expertise
      if (expertise === 'Others') {
        this.customExpertise = [];
        this.otherExpertise = '';
      }
    }
  }

  addOtherExpertise() {
    if (this.otherExpertise.trim() && !this.customExpertise.includes(this.otherExpertise.trim())) {
      this.customExpertise.push(this.otherExpertise.trim());
      this.otherExpertise = '';
    }
  }

  removeCustomExpertise(expertise: string) {
    this.customExpertise = this.customExpertise.filter(item => item !== expertise);
  }

  openTermsModal() {
    this.dialog.open(TermsAndConditionModal, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'terms-modal-dialog'
    });
  }

  onSubmit() {
    if (this.isSubmitting) return;

    // Validate required fields
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Prepare form data for API
    const submitData = {
      ...this.formData,
      areasOfExpertise: [...this.formData.areasOfExpertise.filter(item => item !== 'Others'), ...this.customExpertise]
    };

    // Remove linkedInProfile if empty
    if (!submitData.linkedInProfile) {
      delete submitData.linkedInProfile;
    }

    // Add delay before API call to simulate processing
    setTimeout(() => {
      this.apiService.createCommunity(submitData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Application Submitted!',
              text: response.message || 'Your community membership application has been submitted successfully! We will review it and get back to you soon.',
              confirmButtonColor: '#A50034'
            });
            
            this.resetForm();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message || 'Something went wrong. Please try again.',
              confirmButtonColor: '#A50034'
            });
          }
        },
        error: (error: any) => {
          this.isSubmitting = false;
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while submitting your application. Please try again.',
            confirmButtonColor: '#A50034'
          });
        }
      });
    }, 1500);
  }

  private validateForm(): boolean {
    const requiredFields = [
      { field: this.formData.name, name: 'Name' },
      { field: this.formData.emailAddress, name: 'Email Address' },
      { field: this.formData.phoneNumber, name: 'Phone Number' },
      { field: this.formData.company, name: 'Company' },
      { field: this.formData.designation, name: 'Designation' },
      { field: this.formData.yearsOfExperience, name: 'Years of Experience' },
      { field: this.formData.whyJoinCommunity, name: 'Why join community' },
      { field: this.formData.howCanContribute, name: 'How can contribute' }
    ];

    for (const field of requiredFields) {
      if (field.name === 'Years of Experience') {
        // Special validation for years of experience as number
        const yearsValue = Number(field.field);
        if (!field.field || isNaN(yearsValue) || yearsValue <= 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: `Please fill in the ${field.name} field.`,
            confirmButtonColor: '#A50034'
          });
          return false;
        }
      } else {
        if (!field.field || field.field.toString().trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: `Please fill in the ${field.name} field.`,
            confirmButtonColor: '#A50034'
          });
          return false;
        }
      }
    }

    if (this.formData.areasOfExpertise.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select at least one area of expertise.',
        confirmButtonColor: '#A50034'
      });
      return false;
    }

    if (!this.formData.agreement) {
      Swal.fire({
        icon: 'warning',
        title: 'Agreement Required',
        text: 'Please agree to the terms and conditions to proceed.',
        confirmButtonColor: '#A50034'
      });
      return false;
    }

    return true;
  }

  private resetForm() {
    this.formData = {
      name: '',
      emailAddress: '',
      phoneNumber: '',
      linkedInProfile: '',
      company: '',
      designation: '',
      yearsOfExperience: 0,
      areasOfExpertise: [],
      whyJoinCommunity: '',
      howCanContribute: '',
      email: false,
      whatsapp: false,
      slack: false,
      openToMentoring: false,
      agreement: false
    };
    this.otherExpertise = '';
    this.customExpertise = [];
  }
}
