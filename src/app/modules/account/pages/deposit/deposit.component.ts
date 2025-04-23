import {Component, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {InputParserService} from "../../../../services/input-parser/input-parser.service";
import {Subject} from "rxjs";
import { DepositStateService } from 'src/app/services/deposit/deposit-state.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit{

  depositForm: FormGroup;
  amountControl = new FormControl(0);
  amount  = 0.00;
  amountChanged: Subject<number> = new Subject<number>();

  constructor(private stepsProgressService: StepsProgressServiceService,
              private router: Router,
              private messageService: MessageService,
              private inputParserService: InputParserService,
              private depositStateService: DepositStateService
  ) {
    this.depositForm = new FormGroup({
      paymentMethod: new FormControl('', Validators.required)
    });

    this.amountControl = new FormControl(0, [Validators.required, this.nonZeroValidator.bind(this), Validators.min(1) ]);

  }


/**
 * Restore form values from saved state
 */
restoreFormValues(): void {
  const depositState = this.depositStateService.getDepositState();
  
  if (depositState) {
    // Restore amount if available
    if (depositState.amount !== undefined && depositState.amount !== null) {
      this.amountControl.setValue(depositState.amount);
    }
    
    // Restore payment method if available
    if (depositState.paymentMethod) {
      this.depositForm.get('paymentMethod')?.setValue(depositState.paymentMethod);
    }
  }
}

  numericOnly(event: KeyboardEvent): boolean {
    const char = event.key;
    if (char === 'Backspace' || char === 'Delete') {
      return true;
    }
    if (char === ' ') {
      event.preventDefault();
      return false;
    }
    return !isNaN(Number(char));
  }

  nonZeroValidator(control: FormControl): {[key: string]: boolean} | null {
    const value = control.value;
    if (control.touched && (value === null || value === undefined || value === '' || value === 0 || value.min < 1)) {
      return { 'nonZero': true };
    }
    if (control.touched && control.value < 1) {
      return {'min': true};
    }
    return null;
  }

  parseInputValue(event: Event): void {
    this.amountControl.setValue(this.inputParserService.parseInputValue(event));
  }
  

  goToNextStep() {
    if (this.depositForm.valid && this.amountControl.valid) {
      const amount = this.amountControl.value;
      const paymentMethod = this.depositForm.get('paymentMethod')?.value;
      
      // Save to state service
      this.depositStateService.saveDepositState({
        amount: amount as number,
        paymentMethod: paymentMethod as string
      });
      
      // Navigate to confirmation with router state (for smoother transition)
      this.router.navigate(['/account/deposit-confirm'], { state: { amount, paymentMethod } }).then(r => {
        this.stepsProgressService.setCurrentStep(1);
      });
    } else {
      this.showErrorMessage();
    }
  }


  goToPreviousStep(){

  }

  ngOnInit(): void {
    this.stepsProgressService.setSteps(['Deposit', 'Confirm', 'Success']);
    this.stepsProgressService.setCurrentStep(0);

    this.amountControl.valueChanges.subscribe(value => {
      this.amount = value as number;
    });

    this.restoreFormValues();
  }

  showErrorMessage() {
    if (this.amountControl.invalid) {
      this.messageService.add({
        severity: 'error', 
        summary: 'Invalid Amount', 
        detail: this.amountControl.value === 0 ? 'Amount must be greater than zero' : 'Please enter a valid amount'
      });
    }

    if (this.depositForm.get('paymentMethod')?.invalid) {
      this.messageService.add({
        severity: 'error', 
        summary: 'Missing Information', 
        detail: 'Please select a payment method'
      });
    }
  }
}
