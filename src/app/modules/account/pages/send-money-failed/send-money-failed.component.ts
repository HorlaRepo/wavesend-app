import {Component, OnInit} from '@angular/core';
import {StepsProgressServiceService} from "../../../../services/steps-progress/steps-progress-service.service";
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-send-money-failed',
  templateUrl: './send-money-failed.component.html',
  styleUrls: ['./send-money-failed.component.css']
})

export class SendMoneyFailedComponent implements OnInit {

  currentStep = 2;
  errorMessage = '';
  amount = 0;

  constructor(private stepsProgressService: StepsProgressServiceService,
              private location: Location,
              private router: Router) {
  }

  ngOnInit(): void {
    this.initProgressService();
    this.getTransactionDetails();
  }

  initProgressService() {
    this.stepsProgressService.setSteps(['Details', 'Confirm', 'Failed']);
    this.stepsProgressService.setCurrentStep(this.currentStep);
  }

  sendMoneyAgain(){
    this.router.navigate(['/account/send']);
  }

  getTransactionDetails(){
    const transactionDetails =  this.location.getState() as
      {
        errorMessage: string;
        amount: number;
      };

    this.errorMessage = transactionDetails.errorMessage;
    this.amount = transactionDetails.amount;

  }

}
