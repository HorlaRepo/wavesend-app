import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';


import { AccountRoutingModule } from './account-routing.module';
import { MainComponent } from './pages/main/main.component';
import { AccountHeaderComponent } from './components/account-header/account-header.component';
import { AccountFooterComponent } from './components/account-footer/account-footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { BalanceComponent } from './components/balance/balance.component';
import { NeedHelpComponent } from './components/need-help/need-help.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SettingsNotificationsComponent } from './pages/settings-notifications/settings-notifications.component';
import { SettingsProfileComponent } from './pages/settings-profile/settings-profile.component';
import { SettingsSecurityComponent } from './pages/settings-security/settings-security.component';
import { SettingsPaymentMethodsComponent } from './pages/settings-payment-methods/settings-payment-methods.component';
import { SettingsMenuComponent } from './components/settings-menu/settings-menu.component';
import { DepositWithdrawMenuComponent } from './components/deposit-withdraw-menu/deposit-withdraw-menu.component';
import { DepositComponent } from './pages/deposit/deposit.component';
import { WithdrawComponent } from './pages/withdraw/withdraw.component';
import { DepositConfirmComponent } from './pages/deposit-confirm/deposit-confirm.component';
import { DepositSuccessComponent } from './pages/deposit-success/deposit-success.component';
import { StepsProgressBarComponent } from './components/steps-progress-bar/steps-progress-bar.component';
import {ToastModule} from "primeng/toast";
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { DepositFailedComponent } from './pages/deposit-failed/deposit-failed.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { SendMoneyComponent } from './pages/send-money/send-money.component';
import { SendMoneyConfirmComponent } from './pages/send-money-confirm/send-money-confirm.component';
import { SendMoneySuccessComponent } from './pages/send-money-success/send-money-success.component';
import { WithdrawConfirmComponent } from './pages/withdraw-confirm/withdraw-confirm.component';
import { WithdrawSuccessComponent } from './pages/withdraw-success/withdraw-success.component';
import {LocalDateTimePipe} from "./LocalDateTimePipe";
import { NumericOnlyDirective } from './directives/numeric-only.directive';
import {AmountPipe} from "../../pipes/amount.pipe";
import { SendMoneyFailedComponent } from './pages/send-money-failed/send-money-failed.component';
import { WithdrawFailedComponent } from './pages/withdraw-failed/withdraw-failed.component';
import { ProfileCompletenessComponent } from './components/profile-completeness/profile-completeness.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {ButtonModule} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import { TabViewModule } from 'primeng/tabview';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { DateRangeModalComponent } from './components/date-range-modal/date-range-modal.component';
import { BeneficiarySuggestionComponent } from './components/beneficiary-suggestion/beneficiary-suggestion.component';
import { ToastNotificationsComponent } from './components/toast-notifications/toast-notifications.component';
import { ScheduleTransferComponent } from './components/schedule-transfer/schedule-transfer.component';
import { ScheduledTransferDetailComponent } from './components/scheduled-transfer-detail/scheduled-transfer-detail.component';
import { FloatingSuggestionComponent } from './components/floating-suggestion/floating-suggestion.component';
import { OtpVerificationComponent } from './components/otp-verification/otp-verification.component';
import { TransferOtpComponent } from './pages/transfer-otp/transfer-otp.component';
import { WithdrawalOtpComponent } from './pages/withdrawal-otp/withdrawal-otp.component';
import { ScheduledTransferOtpComponent } from './pages/scheduled-transfer-otp/scheduled-transfer-otp.component';
import { ScheduleSuccessComponent } from './pages/schedule-success/schedule-success.component';
import { environment } from '../../../environments/environment';



@NgModule({
    declarations: [
        MainComponent,
        AccountHeaderComponent,
        AccountFooterComponent,
        DashboardComponent,
        TransactionsComponent,
        ProfileDetailsComponent,
        BalanceComponent,
        NeedHelpComponent,
        SettingsNotificationsComponent,
        SettingsProfileComponent,
        SettingsSecurityComponent,
        SettingsPaymentMethodsComponent,
        SettingsMenuComponent,
        DepositWithdrawMenuComponent,
        DepositComponent,
        WithdrawComponent,
        DepositConfirmComponent,
        DepositSuccessComponent,
        StepsProgressBarComponent,
        DepositFailedComponent,
        SendMoneyComponent,
        SendMoneyConfirmComponent,
        SendMoneySuccessComponent,
        WithdrawConfirmComponent,
        WithdrawSuccessComponent,
        NumericOnlyDirective,
        SendMoneyFailedComponent,
        WithdrawFailedComponent,
        ProfileCompletenessComponent,
        DateRangeModalComponent,
        BeneficiarySuggestionComponent,
        ToastNotificationsComponent,
        ScheduleTransferComponent,
        ScheduledTransferDetailComponent,
        FormatDatePipe,
        FloatingSuggestionComponent,
        OtpVerificationComponent,
        TransferOtpComponent,
        WithdrawalOtpComponent,
        ScheduledTransferOtpComponent,
        ScheduleSuccessComponent,
    ],
    exports: [
        AccountFooterComponent
    ],
    imports: [
        CommonModule,
        AccountRoutingModule,
        ConfirmDialogModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDaterangepickerMd.forRoot(),
        ToastModule,
        MatTooltipModule,
        NgbModule,
        DialogModule,
        InputTextModule,
        DividerModule,
        FontAwesomeModule,
        LocalDateTimePipe,
        AmountPipe,
        MatDialogModule,
        MatInputModule,
        MatDatepickerModule,
        MatOptionModule,
        MatSelectModule,
        MatButtonModule,
        ButtonModule,
        CalendarModule,
        DropdownModule,
        NgOptimizedImage,
        TabViewModule,
    ],
    providers: [
      { provide: 'BASE_PATH', useValue: environment.apiUrl }
    ],
})
export class AccountModule { }
