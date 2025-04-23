import { Component, OnInit } from '@angular/core';
import { StepsProgressServiceService } from "../../../../services/steps-progress/steps-progress-service.service";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { MessageService } from 'primeng/api';
import { PaymentProcessingControllerService } from "../../../../services/services/payment-processing-controller.service";
import { ApiResponseTransactionResponseDto } from "../../../../services/models/api-response-transaction-response-dto";
import { UserInfo } from "../../../../services/keycloack/user-info";
import { UserRepresentation } from "../../../../services/models/user-representation";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { UserBeneficiariesControllerService } from 'src/app/services/services/user-beneficiaries-controller.service';
import { TransferStateService } from 'src/app/services/transfer/transfer-state.service';
import { MoneyTransferControllerService } from 'src/app/services/services/money-transfer-controller.service';

@Component({
  selector: 'app-send-money-confirm',
  templateUrl: './send-money-confirm.component.html',
  styleUrls: ['./send-money-confirm.component.css'],
  providers: [MessageService]
})
export class SendMoneyConfirmComponent implements OnInit {

  currentStep = 1;

  user: UserInfo | undefined;
  recipient: UserRepresentation | undefined;
  amount = 0;
  narration = '';
  errorMessage = '';
  paymentResponse: ApiResponseTransactionResponseDto | undefined;
  isLoading = false;

  isRecipientBeneficiary = false;
  beneficiaryId: number | null = null;
  isProcessingBeneficiary = false;

  constructor(private stepsProgressService: StepsProgressServiceService,
    public location: Location,
    private router: Router,
    private paymentProcessingService: PaymentProcessingControllerService,
    private userBeneficiariesService: UserBeneficiariesControllerService,
    private messageService: MessageService,
    private transferStateService: TransferStateService,
    private transferService: MoneyTransferControllerService,
  ) {
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Verify', 'Success']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  ngOnInit(): void {
    this.getTransactionDetails();
    this.initProgressService();
    this.checkIfBeneficiary();
  }

  checkIfBeneficiary(): void {
    if (!this.recipient?.email) return;

    this.userBeneficiariesService.getUserBeneficiaries()
      .subscribe({
        next: (response) => {
          const beneficiaries = (response?.data || []) as Array<{ email: string; id?: number }>;
          const existingBeneficiary = beneficiaries.find(
            (beneficiary: { email: string; id?: number }) => beneficiary.email === this.recipient?.email
          );

          if (existingBeneficiary) {
            this.isRecipientBeneficiary = true;
            this.beneficiaryId = existingBeneficiary.id!;
          }
        },
        error: (err) => {
          console.error('Error checking beneficiaries:', err);
        }
      });
  }

  toggleBeneficiary(): void {
    if (this.isProcessingBeneficiary) return;

    if (!this.isRecipientBeneficiary) {
      this.addBeneficiary();
    } else if (this.beneficiaryId) {
      this.deleteBeneficiary(this.beneficiaryId);
    }
  }

  goBack() {
    // Keep the state in localStorage but navigate back
    this.router.navigate(['/account/send']);
  }


  initiateTransfer() {
    this.isLoading = true;
    this.transferService.initiateTransfer({
      body: {
        amount: this.amount,
        narration: this.narration,
        senderEmail: this.user?.email,
        receiverEmail: this.recipient?.email
      }
    })
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success === true && response.data?.transferToken) {
            // Store the state in case it's needed
            this.transferStateService.updateTransferState({
              transferToken: response.data.transferToken
            });

            // Navigate to OTP verification page
            this.router.navigate(['/account/transfer-otp'], {
              state: {
                transferToken: response.data.transferToken,
                amount: this.amount,
                recipientEmail: this.recipient?.email,
                recipientName: `${this.recipient?.firstName} ${this.recipient?.lastName}`.trim()
              }
            });

            // Update progress step
            this.stepsProgressService.setCurrentStep(2); // OTP verification step
          } else {
            this.errorMessage = response.message || 'Failed to initiate transfer';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.errorMessage
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.message || 'Failed to initiate transfer';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.errorMessage
          });
        }
      });
  }


  getTransactionDetails() {
    // Try to get data from router state first (for smooth navigation experience)
    const routerState = this.location.getState() as {
      sender: UserInfo;
      recipient: UserRepresentation;
      amount: number;
      narration: string;
    };

    if (routerState?.recipient && routerState?.amount) {
      this.user = routerState.sender;
      this.recipient = routerState.recipient;
      this.amount = routerState.amount;
      this.narration = routerState.narration;
      return;
    }

    // If router state is not available (e.g., after refresh), get data from service
    const transferState = this.transferStateService.getTransferState();

    if (transferState?.recipient && transferState?.amount) {
      this.user = transferState.sender;
      this.recipient = transferState.recipient;
      this.amount = transferState.amount;
      this.narration = transferState.narration!;
    } else {
      // If no data is available, redirect back to the send money page
      this.router.navigate(['/account/send']);
    }
  }

  // sendMoney() {
  //   this.isLoading = true;
  //   this.paymentProcessingService.sendMoney({
  //     body: {
  //       amount: this.amount,
  //       narration: this.narration,
  //       senderEmail: this.user?.email,
  //       receiverEmail: this.recipient?.email
  //     }
  //   })
  //     .subscribe({
  //       next: (data) => {
  //         this.isLoading = false;
  //         this.paymentResponse = data;
  //         this.proceedToSuccessPage();
  //       },
  //       error: (err) => {
  //         this.isLoading = false;
  //         this.errorMessage = err.error.message
  //         this.proceedToFailurePage();
  //       }
  //     })
  // }

  addBeneficiary(): void {
    if (!this.recipient || !this.recipient.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Recipient information is incomplete'
      });
      return;
    }

    this.isProcessingBeneficiary = true;

    this.userBeneficiariesService.addUserBeneficiary({
      body: {
        email: this.recipient.email,
        name: (this.recipient.firstName || '') + ' ' + (this.recipient.lastName || ''),
      }
    }).subscribe({
      next: (response) => {
        this.isProcessingBeneficiary = false;
        this.isRecipientBeneficiary = true;
        this.beneficiaryId = response?.data?.id || null;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Recipient added to your beneficiaries'
        });
      },
      error: (err) => {
        this.isProcessingBeneficiary = false;
        this.isRecipientBeneficiary = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to add beneficiary'
        });

        console.error('Error adding beneficiary:', err);
      }
    });
  }


  deleteBeneficiary(id: number): void {
    this.isProcessingBeneficiary = true;

    this.userBeneficiariesService.deleteUserBeneficiary({
      beneficiaryId: id
    }).subscribe({
      next: () => {
        this.isProcessingBeneficiary = false;
        this.isRecipientBeneficiary = false;
        this.beneficiaryId = null;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Recipient removed from your beneficiaries'
        });
      },
      error: (err) => {
        this.isProcessingBeneficiary = false;
        // Keep the current state since deletion failed

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to remove beneficiary'
        });

        console.error('Error removing beneficiary:', err);
      }
    });
  }

  getBeneficiaries() {
    this.isLoading = true;
    this.userBeneficiariesService.getUserBeneficiaries()
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          console.log(data);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
        }
      })
  }

  proceedToSuccessPage() {
    this.transferStateService.clearTransferState();

    this.router.navigate(['/account/send-success'],
      { state: { paymentResponse: this.paymentResponse } });
  }

  proceedToFailurePage() {
    this.router.navigate(['/account/send-failed'],
      { state: { errorMessage: this.errorMessage, amount: this.amount } });
  }

}
