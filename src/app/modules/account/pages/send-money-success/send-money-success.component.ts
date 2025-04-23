import {Component, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Location} from "@angular/common";
import {ApiResponseTransactionResponseDto} from "../../../../services/models/api-response-transaction-response-dto";
import {Router} from "@angular/router";
import { TransferStateService } from 'src/app/services/transfer/transfer-state.service';

@Component({
  selector: 'app-send-money-success',
  templateUrl: './send-money-success.component.html',
  styleUrls: ['./send-money-success.component.css']
})
export class SendMoneySuccessComponent implements OnInit{
  amount = 0;
  recipientEmail = '';
  recipientName = '';
  transactionId = '';
  transactionDate = '';
  errorMessage = '';
  currentStep = 2;
  paymentResponse: any | undefined;
  isAnimationComplete = false;

  constructor(
    private stepsProgressService: StepsProgressServiceService,
    private location: Location,
    private router: Router,
    private transferStateService: TransferStateService
  ) {}

  ngOnInit(): void {
    this.initProgressService();
    this.getTransactionResponse();
    
    // Set animation complete flag after animation finishes
    setTimeout(() => {
      this.isAnimationComplete = true;
    }, 1200);

   if (this.paymentResponse) {
      this.transferStateService.clearTransferState();
    }
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  getTransactionResponse() {
    // Log state for debugging
    console.log('Router state:', window.history.state);
    
    // Try to get payment response from router state
    const state = window.history.state;
    
    if (state) {
      if (state.paymentResponse) {
        console.log('Payment response found:', state.paymentResponse);
        this.paymentResponse = state.paymentResponse;
        
        // Set other details
        if (state.amount) this.amount = state.amount;
        if (state.recipientEmail) this.recipientEmail = state.recipientEmail;
        if (state.recipientName) this.recipientName = state.recipientName;
        
        // Extract transaction reference number
        if (this.paymentResponse?.data?.referenceNumber) {
          this.transactionId = this.paymentResponse.data.referenceNumber;
        }
        
        // Process transaction date if available
        if (this.paymentResponse?.data?.transactionDate) {
          // Format the date as needed
          this.transactionDate = this.paymentResponse.data.transactionDate;
        }
        
        return;
      }
    }
    
    // If we get here, we couldn't find the transaction data
    console.error('No payment response found in state');
    this.errorMessage = 'Transaction details not available';
    // Consider showing an error message or redirecting
  }


  printReceipt(): void {
    window.print();
  }

  sendMoneyAgain(): void {
    this.router.navigate(['/account/send']);
  }

  goToDashboard(): void {
    this.router.navigate(['/account/dashboard']);
  }
}