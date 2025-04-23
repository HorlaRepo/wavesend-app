import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { StepsProgressServiceService } from "../../../../services/steps-progress/steps-progress-service.service";
import { NavigationStart, Router } from "@angular/router";
import { jsPDF } from 'jspdf';
import { PaymentInfoService } from "../../../../services/stripe/payment-info.service";
import { TransactionControllerService } from "../../../../services/services/transaction-controller.service";
import { Transaction } from "../../../../services/models/transaction";
import { HttpClient } from "@angular/common/http";
import { DepositStateService } from 'src/app/services/deposit/deposit-state.service';

@Component({
  selector: 'app-deposit-success',
  templateUrl: './deposit-success.component.html',
  styleUrls: ['./deposit-success.component.css']
})
export class DepositSuccessComponent implements OnInit, OnDestroy {

  amount = 0;
  transaction: Transaction | undefined;
  transactionRef: string | null = '';
  isAnimationComplete = false;

  constructor(private stepsProgressService: StepsProgressServiceService,
    private router: Router,
    private paymentInfoService: PaymentInfoService,
    private transactionService: TransactionControllerService,
    private depositStateService: DepositStateService) {
  }

  fetchTransaction() {
    this.transactionService.getTransactionByReferenceNumber({
      referenceNumber: this.transactionRef!
    }).subscribe({
      next: transaction => {
        console.log(transaction);
        this.transaction = transaction.data?.at(0);
        setTimeout(() => {
          this.isAnimationComplete = true;
        }, 1200);
      },
      error: err => {
        console.error('Error fetching transaction:', err);
        // Handle error state
        this.isAnimationComplete = true;
      }
    });
  }

  goToNextStep() {
    this.stepsProgressService.setCurrentStep(3);
  }

  ngOnInit(): void {
    // Try to get transaction ref from PaymentInfoService first
    this.transactionRef = this.paymentInfoService.getTransactionReference();
    
    // If not available, try to get from saved state
    if (!this.transactionRef) {
      const savedState = this.depositStateService.getDepositState();
      if (savedState?.transactionRef) {
        this.transactionRef = savedState.transactionRef;
      } else {
        // If no transaction reference found, redirect to deposit page
        console.log('No transaction reference found, redirecting to deposit page');
        this.router.navigate(['/account/deposit']);
        return;
      }
    }
    
    this.stepsProgressService.setSteps(['Deposit', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(2);
    this.fetchTransaction();
    console.log("Transaction Reference After: " + this.transactionRef);
  }


  confirmTransactionDisplayed(): void {
    // Clear payment info and deposit state when transaction is confirmed displayed
    this.paymentInfoService.clearTransactionReference();
    this.depositStateService.clearDepositState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.transaction) {
        // Only clear state after transaction is fully loaded and displayed
        this.confirmTransactionDisplayed();
      }
    }, 2000); // Allow time for animation + rendering
  }
  

  ngOnDestroy(): void {

  }

  loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }


  goToDeposit() {
    this.router.navigate(['/account/deposit']);
  }

  formatTransactionDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const dateParts = String(dateString).split(',').map(part => parseInt(part, 10));
      // Month in JS is 0-indexed, so subtract 1 from the month part
      const transactionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return transactionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  }



  async printTransactionDetails() {
    try {
      const doc = new jsPDF();
      const logoUrl = 'assets/images/logo.png';
      const logoData = await this.loadImage(logoUrl);
      const pageCenter = doc.internal.pageSize.width / 2;

      // Add logo
      doc.addImage(logoData, 'PNG', pageCenter - 20, 10, 40, 20);

      // Add title
      doc.setFontSize(22);
      doc.setTextColor(46, 190, 96); // Green color for title
      doc.text('Transaction Receipt', pageCenter, 45, { align: 'center' });

      // Add separator
      doc.setDrawColor(46, 190, 96);
      doc.setLineWidth(0.5);
      doc.line(20, 50, pageCenter * 2 - 20, 50);

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Format date
      const formattedDate = this.formatTransactionDate(String(this.transaction?.transactionDate));

      // Transaction details section
      doc.setFontSize(12);
      doc.text('Transaction Details', 20, 65);

      doc.setFontSize(10);
      doc.text('Description:', 20, 75);
      doc.text(`${this.transaction?.description || 'Deposit'}`, 80, 75);

      doc.text('Amount:', 20, 85);
      doc.text(`${this.transaction?.amount} USD`, 80, 85);

      doc.text('Date and Time:', 20, 95);
      doc.text(`${formattedDate}`, 80, 95);

      doc.text('Reference Number:', 20, 105);
      doc.text(`${this.transaction?.referenceNumber}`, 80, 105);

      doc.text('Status:', 20, 115);
      doc.text(`${this.transaction?.currentStatus}`, 80, 115);

      // Add success checkmark
      doc.setFillColor(46, 190, 96);
      doc.circle(pageCenter, 140, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('✓', pageCenter, 144, { align: 'center' });

      // Add thank you message
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Thank you for using our services!', pageCenter, 165, { align: 'center' });

      // Add footer
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageCenter, 180, { align: 'center' });
      doc.text('This is an electronically generated receipt.', pageCenter, 185, { align: 'center' });

      doc.save(`Transaction-${this.transaction?.referenceNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  }
}

