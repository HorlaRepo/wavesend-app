import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CountriesService } from "../../../../services/country-list/countries.service";
import { KycVerificationControllerService } from "../../../../services/services/kyc-verification-controller.service";
import { MessageService } from "primeng/api";
import { KycVerification } from "../../../../services/models/kyc-verification";
import { TabView } from 'primeng/tabview';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css'],
  providers: [MessageService]
})
export class SettingsSecurityComponent implements OnInit {
  @ViewChild('kycTabs') kycTabs!: TabView;

  kycModalVisible = false;
  kycForm: FormGroup;
  countries: string[] = [];
  activeTabIndex: number = 0;

  isUploadingId = false;
  isUploadingAddress = false;

  idUploadProgress: number = 0;
  addressUploadProgress: number = 0;

  idDocumentUploaded = false;
  addressDocumentUploaded = false;

  idUploadFailed = false;
  addressUploadFailed = false;

  kycVerification: KycVerification | undefined = {};

  idTypes = [
    { label: 'International Passport', value: 'International Passport' },
    { label: 'Driver\'s License', value: 'Driver\'s License' },
    { label: 'National ID', value: 'National ID' }
  ];

  idProof: File | null = null;
  addressProof: File | null = null;
  idProofPreview: string | ArrayBuffer | null = null;
  addressProofPreview: string | ArrayBuffer | null = null;

  // Password change
  passwordModalVisible = false;
  passwordForm: FormGroup;
  isChangingPassword = false;

  // 2FA
  twoFactorEnabled = false;
  isToggling2fa = false;

  constructor(
    private fb: FormBuilder,
    private countryService: CountriesService,
    private kycVerificationService: KycVerificationControllerService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.kycForm = this.fb.group({
      country: [''],
      idType: [''],
      idNumber: [''],
      expiryDate: [''],
      idProof: [null],
      addressProof: [null]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.getKycVerificationStatus();
    this.load2faStatus();
  }

  // ---------- Password Change ----------

  showPasswordModal(): void {
    this.passwordForm.reset();
    this.passwordModalVisible = true;
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'New password and confirmation do not match'
      });
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        if (response.success) {
          this.passwordModalVisible = false;
          this.passwordForm.reset();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password changed successfully'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to change password'
          });
        }
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to change password'
        });
      }
    });
  }

  // ---------- Two-Factor Authentication ----------

  load2faStatus(): void {
    const user = this.authService.currentUser;
    this.twoFactorEnabled = user?.twoFactorEnabled || false;
  }

  onToggle2fa(): void {
    const newState = !this.twoFactorEnabled;
    this.isToggling2fa = true;

    this.authService.toggle2fa(newState).subscribe({
      next: (response) => {
        this.isToggling2fa = false;
        if (response.success) {
          this.twoFactorEnabled = newState;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Two-factor authentication has been ${newState ? 'enabled' : 'disabled'}`
          });
          // Refresh user profile to sync state
          this.authService.loadUserProfile().then(() => {
            this.load2faStatus();
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to update 2FA settings'
          });
        }
      },
      error: (err) => {
        this.isToggling2fa = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to update 2FA settings'
        });
      }
    });
  }

  // ---------- KYC ----------

  showKycModal(): void {
    if (this.isVerifyButtonDisabled()) {
      return; // Don't show modal if button is disabled
    }

    this.resetProgress();
    this.setInitialActiveTab();
    this.kycModalVisible = true;
  }


  /**
 * Check if the verification button should be disabled
 */
  isVerifyButtonDisabled(): boolean {
    const idStatus = this.kycVerification?.idVerificationStatus;
    const addressStatus = this.kycVerification?.addressVerificationStatus;

    // Disable button when both statuses are APPROVED or both are PENDING
    return (idStatus === 'APPROVED' && addressStatus === 'APPROVED') ||
      (idStatus === 'PENDING' && addressStatus === 'PENDING');
  }

  /**
   * Get button text based on verification statuses
   */
  getVerifyButtonText(): string {
    const idStatus = this.kycVerification?.idVerificationStatus;
    const addressStatus = this.kycVerification?.addressVerificationStatus;

    if (idStatus === 'APPROVED' && addressStatus === 'APPROVED') {
      return 'Fully Verified';
    } else if (idStatus === 'PENDING' && addressStatus === 'PENDING') {
      return 'Verification Pending';
    } else if (idStatus === 'REJECTED' || addressStatus === 'REJECTED') {
      return 'Re-Upload Documents';
    } else {
      return 'Verify Now';
    }
  }

  /**
 * Check if ID verification tab should be enabled
 */
  isIdVerificationTabEnabled(): boolean {
    const status = this.kycVerification?.idVerificationStatus;
    return status === 'UNVERIFIED' || status === 'REJECTED';
  }

  /**
   * Check if address verification tab should be enabled
   */
  isAddressVerificationTabEnabled(): boolean {
    const status = this.kycVerification?.addressVerificationStatus;
    return status === 'UNVERIFIED' || status === 'REJECTED';
  }

  /**
 * Sets the initial active tab index when opening the modal
 */
  setInitialActiveTab(): void {
    const idStatus = this.kycVerification?.idVerificationStatus;
    const addressStatus = this.kycVerification?.addressVerificationStatus;

    if (!this.isIdVerificationTabEnabled() && this.isAddressVerificationTabEnabled()) {
      // If ID is verified/pending but address is not, show address tab
      this.activeTabIndex = 1;
    } else {
      // Default to ID tab in all other cases
      this.activeTabIndex = 0;
    }
  }

  /**
   * Validates if the file name is within acceptable length
   * @param file The file to validate
   * @returns boolean indicating if the file name is valid
   */
  private isFileNameValid(file: File | null): boolean {
    if (!file) return false;

    const MAX_FILENAME_LENGTH = 50;
    return file.name.length <= MAX_FILENAME_LENGTH;
  }

  /**
   * Shows file name error message
   * @param fileType Type of document being uploaded
   */
  private showFileNameTooLongError(fileType: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'File Name Too Long',
      detail: `The ${fileType} document file name exceeds the maximum allowed length of 50 characters. Please rename your file with a shorter name and try again.`,
      life: 7000
    });
  }

  resetProgress(): void {
    this.idUploadProgress = 0;
    this.addressUploadProgress = 0;
    this.idDocumentUploaded = false;
    this.addressDocumentUploaded = false;
    this.idUploadFailed = false;
    this.addressUploadFailed = false;
    this.activeTabIndex = 0;
  }

  fetchCountries() {
    this.countryService.getCountriesCommonNames().subscribe({
      next: (data: string[]) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
      }
    });
  }

  getKycVerificationStatus() {
    this.kycVerificationService.getKycStatus().subscribe({
      next: (data) => {
        this.kycVerification = data.data;
        console.log(data);
      },
      error: (err) => {
        console.error('Error fetching KYC verification status:', err);
      }
    });
  }

  /**
 * Get display status text
 */
  getStatusDisplayText(status: string | undefined): string {
    switch (status) {
      case 'APPROVED': return 'Verified';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      case 'UNVERIFIED':
      default: return 'Not Verified';
    }
  }

  /**
   * Get CSS class for status badge
   */
  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'APPROVED': return 'verified';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      case 'UNVERIFIED':
      default: return 'not-active';
    }
  }



  onFileSelected(event: Event, type: 'idProof' | 'addressProof') {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'idProof') {
          this.idProof = file;
          this.idProofPreview = reader.result as string;
        } else if (type === 'addressProof') {
          this.addressProof = file;
          this.addressProofPreview = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  isImageFile(file: File | null): boolean {
    return file ? file.type.startsWith('image/') : false;
  }

  isPdfFile(file: File | null): boolean {
    return file ? file.type === 'application/pdf' : false;
  }

  removeFile(type: 'idProof' | 'addressProof', fileInput: HTMLInputElement) {
    if (type === 'idProof') {
      this.idProof = null;
      this.idProofPreview = null;
      this.idUploadProgress = 0;
    } else if (type === 'addressProof') {
      this.addressProof = null;
      this.addressProofPreview = null;
      this.addressUploadProgress = 0;
    }
    fileInput.value = '';
  }

  onSubmitIdDocument() {
    if (!this.idProof) return;

    // Check file name length
    if (!this.isFileNameValid(this.idProof)) {
      this.showFileNameTooLongError('ID');
      return;
    }

    this.isUploadingId = true;
    this.idUploadProgress = 0;

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (this.idUploadProgress < 90) {
        this.idUploadProgress += 10;
      }
    }, 300);

    this.kycVerificationService.uploadIdDocument({
      body: { file: this.idProof }
    }).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.idUploadProgress = 100;
        this.idDocumentUploaded = true;
        this.isUploadingId = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'ID document uploaded successfully',
        });

        // Switch to address tab after successful upload
        setTimeout(() => {
          this.activeTabIndex = 1;
        }, 1000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        console.error('Error uploading ID document:', err);
        this.isUploadingId = false;
        this.idUploadFailed = true;
        this.idUploadProgress = 0;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload ID document',
        });
      }
    });
  }

  onSubmitAddressDocument() {
    if (!this.addressProof) return;

    // Check file name length
    if (!this.isFileNameValid(this.addressProof)) {
      this.showFileNameTooLongError('address verification');
      return;
    }

    this.isUploadingAddress = true;
    this.addressUploadProgress = 0;

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (this.addressUploadProgress < 90) {
        this.addressUploadProgress += 10;
      }
    }, 300);

    this.kycVerificationService.uploadAddressDocument({
      body: { file: this.addressProof }
    }).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.addressUploadProgress = 100;
        this.addressDocumentUploaded = true;
        this.isUploadingAddress = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Address document uploaded successfully',
        });

        // Close modal after successful upload of both documents
        if (this.idDocumentUploaded) {
          setTimeout(() => {
            this.kycModalVisible = false;
            this.getKycVerificationStatus(); // Refresh verification status
          }, 2000);
        }
      },
      error: (err) => {
        clearInterval(progressInterval);
        console.error('Error uploading Address document:', err);
        this.isUploadingAddress = false;
        this.addressUploadFailed = true;
        this.addressUploadProgress = 0;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      }
    });
  }

  onNoClick(): void {
    this.kycModalVisible = false;
  }

  /**
 * Check if file name is too long
 */
  isFileNameTooLong(file: File | null): boolean {
    if (!file) return false;
    const MAX_FILENAME_LENGTH = 50;
    return file.name.length > MAX_FILENAME_LENGTH;
  }

  /**
   * Get file name for display (truncated if needed)
   */
  getDisplayFileName(file: File | null): string {
    if (!file) return '';
    return file.name.length > 35 ? file.name.substring(0, 32) + '...' : file.name;
  }
}
