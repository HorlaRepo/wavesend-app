import {Component, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Location} from "@angular/common";
import {Router} from "@angular/router";
import {StripeService} from "../../../../services/stripe/stripe.service";
import {MessageService} from "primeng/api";
import {PaymentInfoService} from "../../../../services/stripe/payment-info.service";
import {PaymentProcessingControllerService} from "../../../../services/services/payment-processing-controller.service";
import {UserInfo} from "../../../../services/keycloack/user-info";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {Wallet} from "../../../../services/models/wallet";
import { DepositStateService } from 'src/app/services/deposit/deposit-state.service';

@Component({
  selector: 'app-deposit-confirm',
  templateUrl: './deposit-confirm.component.html',
  styleUrls: ['./deposit-confirm.component.css'],
  providers: [MessageService]
})
export class DepositConfirmComponent implements OnInit {
  amount: number | undefined;
  paymentMethod: string | undefined;
  user: UserInfo | undefined;
  isLoading = false;
  wallet: Wallet | undefined;
  createPaymentParams: { amount: number; userEmail: string } = { amount: 0, userEmail: '' };

  constructor(private stepsProgressService: StepsProgressServiceService,
              private location: Location,
              private router: Router,
              private stripeService: StripeService,
              private messageService: MessageService,
              private paymentInfoService: PaymentInfoService,
              private paymentProcessingService: PaymentProcessingControllerService,
              private keycloakService: KeycloakService,
              private depositStateService: DepositStateService) {

  }

  goToNextStep() {
    this.fundWallet();
  }

  async ngOnInit(): Promise<void> {
    this.user = this.keycloakService.userInfo;
    console.log(this.user)
    this.wallet = await this.keycloakService.fetchUserWallet();
  
    // First try to get data from router state for smoother transitions
    const state = this.location.getState() as { amount: number; paymentMethod: string };
    let amount = state.amount;
    let paymentMethod = state.paymentMethod;
  
    // If router state is empty (refresh or direct navigation), try localStorage
    if (!amount || !paymentMethod) {
      const savedState = this.depositStateService.getDepositState();
      if (savedState?.amount && savedState?.paymentMethod) {
        amount = savedState.amount;
        paymentMethod = savedState.paymentMethod;
      } else {
        // If no state found, redirect back to initial deposit page
        console.log('No deposit data found, redirecting to deposit page');
        this.router.navigate(['/account/deposit']);
        return;
      }
    }
  
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    console.log('These are the Values...', this.amount, this.paymentMethod, this.user?.email);
  
    this.stepsProgressService.setSteps(['Deposit', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(1);
    this.location.subscribe(event => {
      if (event.type === 'popstate') {
        this.stepsProgressService.goToPreviousStep();
      }
    });
  }

  fundWallet() {
    if (this.amount && this.user?.email) {
      this.isLoading = true;
      this.createPaymentParams.amount = this.amount;
      this.createPaymentParams.userEmail = this.user?.email;
      this.paymentProcessingService.createStripePayment({
        body: {
          amount: this.amount,
          email: this.user?.email,
        }
      })
          .subscribe({
            next: response => {
              this.depositStateService.saveDepositState({
                amount: this.amount,
                paymentMethod: this.paymentMethod,
                transactionRef: response.transactionReference
              });
              this.setTransactionReference(response.transactionReference!)
                .then(() => {
                  return this.stripeService.redirectToCheckout(
                    response.sessionId!
                  );
                })
                .catch(error => {
                  console.error('Error during redirect:', error);
                });
              console.log("Amount before: " + this.amount);
              console.log("Transaction Reference before: " + response.transactionReference);
              this.isLoading = false;
              console.log(this.user?.email)
            }, error: err => {
              this.isLoading = false;
              console.error(err);
              this.messageService.add({severity:'error', summary:'Error', detail:err.error.message});
            }
          } );

    } else {
      alert('Amount or user email not provided');
      console.log('Amount or user email not provided');
      this.isLoading = false;
    }

  }

  setTransactionReference(transactionRef: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.paymentInfoService.setTransactionReference(transactionRef);
      resolve();
    });
  }

  goBack() {
    this.router.navigate(['/account/deposit']);
    this.stepsProgressService.setCurrentStep(0);
  }

}
