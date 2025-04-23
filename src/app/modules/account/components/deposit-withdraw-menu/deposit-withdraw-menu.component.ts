import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-deposit-withdraw-menu',
  templateUrl: './deposit-withdraw-menu.component.html',
  styleUrls: ['./deposit-withdraw-menu.component.css']
})
export class DepositWithdrawMenuComponent {
  @Input() activeLink: 'deposit' | 'withdraw' = 'deposit';
}
