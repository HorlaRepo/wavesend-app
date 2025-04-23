import {Component, OnInit} from '@angular/core';
import {BankAccountControllerService} from "../../../../services/services/bank-account-controller.service";
import {KycVerificationControllerService} from "../../../../services/services/kyc-verification-controller.service";
import { KycVerification } from 'src/app/services/models/kyc-verification';

@Component({
  selector: 'app-profile-completeness',
  templateUrl: './profile-completeness.component.html',
  styleUrls: ['./profile-completeness.component.css']
})
export class ProfileCompletenessComponent implements OnInit {

  bankAccountCount: number | undefined = 0;
  isKycVerified: boolean = false;
  isKycPartiallyVerified: boolean = false;
  isKycPending: boolean = false;
  completionPercentage: number = 0;
  kycVerification!: KycVerification;
  
  // Track which verification needs attention
  needsIdVerification: boolean = false;
  needsAddressVerification: boolean = false;
  rejectedId: boolean = false;
  rejectedAddress: boolean = false;

  constructor(private bankAccountService: BankAccountControllerService,
    private kycService: KycVerificationControllerService
  ) {

  }

  ngOnInit(): void {
    this.getBankAccountCount();
    this.getUserKycStatus(); // Fixed: was missing parentheses
  }

  getBankAccountCount(){
    this.bankAccountService.getBankAccountCountByUserId().subscribe((response) => {
      this.bankAccountCount = response.data;
      this.calculateCompletionPercentage();
    });
  }

  calculateCompletionPercentage(): void {
    // Always verified: Email and Mobile (2 items)
    let completedItems = 2;
    let totalItems = 4;
    
    // KYC Verification contributes based on ID and address status
    if (this.kycVerification) {
      const idStatus = this.kycVerification.idVerificationStatus;
      const addressStatus = this.kycVerification.addressVerificationStatus;
      
      if (idStatus === 'APPROVED' && addressStatus === 'APPROVED') {
        completedItems += 1; // Fully verified - adds 1 point
      } else if (idStatus === 'APPROVED' || addressStatus === 'APPROVED') {
        completedItems += 0.5; // Partially verified - adds 0.5 points
      } else if (idStatus === 'PENDING' || addressStatus === 'PENDING') {
        completedItems += 0.25; // Pending verification - adds 0.25 points
      }
    }
    
    if (this.bankAccountCount !== undefined && this.bankAccountCount > 0) {
      completedItems++;
    }
    
    this.completionPercentage = Math.round((completedItems / totalItems) * 100);
  }

  getUserKycStatus(){
    this.kycService.getKycStatus().subscribe((response) => {
      this.kycVerification = response?.data!;
      
      const idStatus = this.kycVerification.idVerificationStatus;
      const addressStatus = this.kycVerification.addressVerificationStatus;
      
      // Determine overall KYC verification status
      this.isKycVerified = idStatus === 'APPROVED' && addressStatus === 'APPROVED';
      
      // Partially verified if at least one is approved
      this.isKycPartiallyVerified = 
        (idStatus === 'APPROVED' && addressStatus !== 'APPROVED') ||
        (addressStatus === 'APPROVED' && idStatus !== 'APPROVED');
      
      // Pending if at least one is pending and none is approved
      this.isKycPending = 
        (idStatus === 'PENDING' || addressStatus === 'PENDING') && 
        idStatus !== 'APPROVED' && addressStatus !== 'APPROVED';
      
      // Determine which verification needs attention
      this.needsIdVerification = idStatus === 'UNVERIFIED' || idStatus === 'REJECTED';
      this.needsAddressVerification = addressStatus === 'UNVERIFIED' || addressStatus === 'REJECTED';
      
      // Track rejected statuses for specific messaging
      this.rejectedId = idStatus === 'REJECTED';
      this.rejectedAddress = addressStatus === 'REJECTED';
      
      // Calculate percentage after getting KYC status
      this.calculateCompletionPercentage();
    });
  }
  
  /**
   * Get the appropriate message for KYC verification status
   */
  getKycStatusMessage(): string {
    if (!this.kycVerification) return 'Complete your identity verification';
    
    const idStatus = this.kycVerification.idVerificationStatus;
    const addressStatus = this.kycVerification.addressVerificationStatus;
    
    if (idStatus === 'APPROVED' && addressStatus === 'APPROVED') {
      return 'Your identity is fully verified';
    }
    
    if (idStatus === 'APPROVED' && addressStatus === 'PENDING') {
      return 'ID verified. Address verification pending';
    }
    
    if (addressStatus === 'APPROVED' && idStatus === 'PENDING') {
      return 'Address verified. ID verification pending';
    }
    
    if (idStatus === 'APPROVED' && addressStatus === 'REJECTED') {
      return 'ID verified. Please re-submit address proof';
    }
    
    if (addressStatus === 'APPROVED' && idStatus === 'REJECTED') {
      return 'Address verified. Please re-submit ID proof';
    }
    
    if (idStatus === 'APPROVED' && addressStatus === 'UNVERIFIED') {
      return 'ID verified. Please complete address verification';
    }
    
    if (addressStatus === 'APPROVED' && idStatus === 'UNVERIFIED') {
      return 'Address verified. Please complete ID verification';
    }
    
    if (idStatus === 'PENDING' && addressStatus === 'PENDING') {
      return 'Your verification is being processed';
    }
    
    if (idStatus === 'REJECTED' && addressStatus === 'REJECTED') {
      return 'Both ID and address verification were rejected';
    }
    
    if (idStatus === 'PENDING') {
      return 'ID verification in progress. Complete address verification';
    }
    
    if (addressStatus === 'PENDING') {
      return 'Address verification in progress. Complete ID verification';
    }
    
    if (idStatus === 'REJECTED') {
      return 'ID verification rejected. Please re-submit';
    }
    
    if (addressStatus === 'REJECTED') {
      return 'Address verification rejected. Please re-submit';
    }
    
    return 'Complete your identity and address verification';
  }
  
  /**
   * Get button text for KYC verification
   */
  getVerifyButtonText(): string {
    if (!this.kycVerification) return 'Verify Now';
    
    const idStatus = this.kycVerification.idVerificationStatus;
    const addressStatus = this.kycVerification.addressVerificationStatus;
    
    if (this.rejectedId || this.rejectedAddress) {
      return 'Re-Submit Documents';
    }
    
    if (this.needsIdVerification || this.needsAddressVerification) {
      return 'Complete Verification';
    }
    
    if (idStatus === 'PENDING' || addressStatus === 'PENDING') {
      return 'Check Status';
    }
    
    return 'Verify Now';
  }
}