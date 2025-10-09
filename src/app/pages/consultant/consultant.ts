import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from "../../shared/components/breadcrumb/breadcrumb";
import { ApiService } from '../../../core/api';
import Swal from 'sweetalert2';

export interface NGOFormData {
  ngoName: string;
  ngoRegistrationNumber: string;
  chairmanPresidentName: string;
  specializedAreas: string[];
  planningToExpand: boolean;
  expansionRegions: string[];
  needFundingSupport: boolean;
  totalFundRequired: number;
  lookingForFundManager: boolean;
  openToSplittingInvestment: boolean;
  hasSpecializedTeam: boolean;
  needAssistance: boolean;
  emailAddress: string;
  websiteAddress?: string;
  phoneNumber: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-consultant',
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './consultant.html',
  styleUrl: './consultant.scss'
})
export class Consultant {
  private apiService = inject(ApiService);

  formData: NGOFormData = {
    ngoName: '',
    ngoRegistrationNumber: '',
    chairmanPresidentName: '',
    specializedAreas: [],
    planningToExpand: false,
    expansionRegions: [],
    needFundingSupport: false,
    totalFundRequired: 0,
    lookingForFundManager: false,
    openToSplittingInvestment: false,
    hasSpecializedTeam: false,
    needAssistance: false,
    emailAddress: '',
    websiteAddress: '',
    phoneNumber: ''
  };

  isSubmitting = false;
  otherSpecializedArea = '';
  customSpecializedAreas: string[] = [];
  otherRegion = '';
  customRegions: string[] = [];

  // Predefined specialized areas
  specializedAreaOptions = [
    'Environmental conservation',
    'Climate resilience',
    'Sustainable agriculture',
    'Healthcare',
    'Education',
    'Microfinance',
    'Women empowerment',
    'Child welfare',
    'Disaster relief',
    'Community development',
    'Others'
  ];

  // Expansion regions
  regionOptions: RegionOption[] = [
    { value: 'East Africa', label: 'East Africa' },
    { value: 'West Africa', label: 'West Africa' },
    { value: 'South Asia', label: 'South Asia' },
    { value: 'East Asia', label: 'East Asia' },
    { value: 'Other', label: 'Other (please specify)' }
  ];

  toggleSpecializedArea(area: string, event: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      if (!this.formData.specializedAreas.includes(area)) {
        this.formData.specializedAreas.push(area);
      }
    } else {
      this.formData.specializedAreas = this.formData.specializedAreas.filter(item => item !== area);
      
      // If "Others" is unchecked, clear custom areas
      if (area === 'Others') {
        this.customSpecializedAreas = [];
        this.otherSpecializedArea = '';
      }
    }
  }

  addOtherSpecializedArea() {
    if (this.otherSpecializedArea.trim() && !this.customSpecializedAreas.includes(this.otherSpecializedArea.trim())) {
      this.customSpecializedAreas.push(this.otherSpecializedArea.trim());
      this.otherSpecializedArea = '';
    }
  }

  removeCustomSpecializedArea(area: string) {
    this.customSpecializedAreas = this.customSpecializedAreas.filter(item => item !== area);
  }

  toggleExpansionRegion(region: string, event: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      if (!this.formData.expansionRegions.includes(region)) {
        this.formData.expansionRegions.push(region);
      }
    } else {
      this.formData.expansionRegions = this.formData.expansionRegions.filter(item => item !== region);
      
      // If "Other" is unchecked, clear custom regions
      if (region === 'Other') {
        this.customRegions = [];
        this.otherRegion = '';
      }
    }
  }

  addOtherRegion() {
    if (this.otherRegion.trim() && !this.customRegions.includes(this.otherRegion.trim())) {
      this.customRegions.push(this.otherRegion.trim());
      this.otherRegion = '';
    }
  }

  removeCustomRegion(region: string) {
    this.customRegions = this.customRegions.filter(item => item !== region);
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
      specializedAreas: [...this.formData.specializedAreas.filter(item => item !== 'Others'), ...this.customSpecializedAreas],
      expansionRegions: [...this.formData.expansionRegions.filter(item => item !== 'Other'), ...this.customRegions]
    };

    // Remove websiteAddress if empty
    if (!submitData.websiteAddress) {
      submitData.websiteAddress = undefined;
    }

    // Add delay before API call to simulate processing
    setTimeout(() => {
      this.apiService.createConsultantsRequest(submitData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Request Submitted!',
              text: response.message || 'Your NGO partnership and funding request has been submitted successfully! We will review it and get back to you soon.',
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
            text: 'An error occurred while submitting your request. Please try again.',
            confirmButtonColor: '#A50034'
          });
        }
      });
    }, 1500);
  }

  private validateForm(): boolean {
    const requiredFields = [
      { field: this.formData.ngoName, name: 'NGO Name' },
      { field: this.formData.ngoRegistrationNumber, name: 'NGO Registration Number' },
      { field: this.formData.chairmanPresidentName, name: 'Chairman/President Name' },
      { field: this.formData.emailAddress, name: 'Email Address' },
      { field: this.formData.phoneNumber, name: 'Phone Number' }
    ];

    for (const field of requiredFields) {
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

    if (this.formData.specializedAreas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select at least one specialized area of operation.',
        confirmButtonColor: '#A50034'
      });
      return false;
    }

    if (this.formData.planningToExpand && this.formData.expansionRegions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select at least one expansion region.',
        confirmButtonColor: '#A50034'
      });
      return false;
    }

    if (this.formData.needFundingSupport && (!this.formData.totalFundRequired || this.formData.totalFundRequired <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter a valid total fund required amount.',
        confirmButtonColor: '#A50034'
      });
      return false;
    }

    return true;
  }

  private resetForm() {
    this.formData = {
      ngoName: '',
      ngoRegistrationNumber: '',
      chairmanPresidentName: '',
      specializedAreas: [],
      planningToExpand: false,
      expansionRegions: [],
      needFundingSupport: false,
      totalFundRequired: 0,
      lookingForFundManager: false,
      openToSplittingInvestment: false,
      hasSpecializedTeam: false,
      needAssistance: false,
      emailAddress: '',
      websiteAddress: '',
      phoneNumber: ''
    };
    this.otherSpecializedArea = '';
    this.customSpecializedAreas = [];
    this.otherRegion = '';
    this.customRegions = [];
  }
}
