import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent} from "./pages/main/main.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {TransactionsComponent} from "./pages/transactions/transactions.component";
import {SettingsMenuComponent} from "./components/settings-menu/settings-menu.component";
import {SettingsProfileComponent} from "./pages/settings-profile/settings-profile.component";
import {SettingsNotificationsComponent} from "./pages/settings-notifications/settings-notifications.component";
import {SettingsSecurityComponent} from "./pages/settings-security/settings-security.component";
import {SettingsPaymentMethodsComponent} from "./pages/settings-payment-methods/settings-payment-methods.component";
import {DepositComponent} from "./pages/deposit/deposit.component";
import {WithdrawComponent} from "./pages/withdraw/withdraw.component";
import {DepositConfirmComponent} from "./pages/deposit-confirm/deposit-confirm.component";
import {DepositSuccessComponent} from "./pages/deposit-success/deposit-success.component";
import {DepositFailedComponent} from "./pages/deposit-failed/deposit-failed.component";
import {WithdrawConfirmComponent} from "./pages/withdraw-confirm/withdraw-confirm.component";
import {WithdrawSuccessComponent} from "./pages/withdraw-success/withdraw-success.component";
import {SendMoneyComponent} from "./pages/send-money/send-money.component";
import {SendMoneyConfirmComponent} from "./pages/send-money-confirm/send-money-confirm.component";
import {SendMoneySuccessComponent} from "./pages/send-money-success/send-money-success.component";
import {SendMoneyFailedComponent} from "./pages/send-money-failed/send-money-failed.component";
import {WithdrawFailedComponent} from "./pages/withdraw-failed/withdraw-failed.component";
import {authGuard} from "../../services/authguard/auth-guard.service";
import { ScheduleTransferComponent } from './components/schedule-transfer/schedule-transfer.component';
import { ScheduledTransferDetailComponent } from './components/scheduled-transfer-detail/scheduled-transfer-detail.component';
import { WithdrawalOtpComponent } from './pages/withdrawal-otp/withdrawal-otp.component';
import { TransferOtpComponent } from './pages/transfer-otp/transfer-otp.component';
import { ScheduledTransferOtpComponent } from './pages/scheduled-transfer-otp/scheduled-transfer-otp.component';
import { ScheduleSuccessComponent } from './pages/schedule-success/schedule-success.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'transactions',
        component: TransactionsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'schedule-transfer',
        component: ScheduleTransferComponent,
        canActivate: [authGuard]
      },
      {
        path: 'scheduled-transfer/:id',
        component: ScheduledTransferDetailComponent,
        canActivate: [authGuard]
      },
      {
        path: 'withdraw-otp',
        component: WithdrawalOtpComponent,
        canActivate: [authGuard],
      },
      {
        path: 'transfer-otp',
        component: TransferOtpComponent,
        canActivate: [authGuard],
      },
      {
        path: 'scheduled-transfer-otp',
        component: ScheduledTransferOtpComponent,
        canActivate: [authGuard],
      },
      {
        path: 'schedule-success',
        component: ScheduleSuccessComponent,
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        component: SettingsMenuComponent,
        canActivate: [authGuard],
        children: [
          {
            path: 'notifications',
            component: SettingsNotificationsComponent,
            canActivate: [authGuard],
          },
          {
            path: '',
            component: SettingsProfileComponent,
            canActivate: [authGuard],
          },
          {
            path: 'security',
            component: SettingsSecurityComponent,
            canActivate: [authGuard],
          },
          {
            path: 'payment-methods',
            component: SettingsPaymentMethodsComponent,
            canActivate: [authGuard],
          }
        ]
      },
      {
        path: 'deposit',
        component: DepositComponent,
        canActivate: [authGuard],
      },
      {
        path: 'withdraw',
        component: WithdrawComponent,
        canActivate: [authGuard],
      },
      {
        path: 'withdraw-confirm',
        component: WithdrawConfirmComponent,
        canActivate: [authGuard],
      },
      {
        path: 'withdraw-success',
        component: WithdrawSuccessComponent,
        canActivate: [authGuard],
      },
      {
        path: 'withdraw-failed',
        component: WithdrawFailedComponent,
        canActivate: [authGuard],
      },
      {
        path: 'deposit-confirm',
        component: DepositConfirmComponent,
        canActivate: [authGuard],
      },
      {
        path: 'deposit-success',
        component: DepositSuccessComponent,
        canActivate: [authGuard],
      },
      {
        path: 'deposit-failed',
        component: DepositFailedComponent
        ,canActivate: [authGuard],
      },
      {
        path: 'send',
        component: SendMoneyComponent,
        canActivate: [authGuard],
      },
      {
        path: 'send-confirm',
        component: SendMoneyConfirmComponent,
        canActivate: [authGuard],
      },
      {
        path: 'send-success',
        component: SendMoneySuccessComponent,
        canActivate: [authGuard],
      },
      {
        path: 'send-failed',
        component: SendMoneyFailedComponent,
        canActivate: [authGuard],
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
