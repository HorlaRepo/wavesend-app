import {Component, OnInit} from '@angular/core';
import {UserNotificationPreferences} from "../../../../services/models/user-notification-preferences";
import {
  UserNotificationPreferencesControllerService
} from "../../../../services/services/user-notification-preferences-controller.service";
import {UserNotificationPreferencesRequest} from "../../../../services/models/user-notification-preferences-request";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {UserInfo} from "../../../../services/keycloack/user-info";
import {MessageService} from "primeng/api";

type BooleanUserNotificationPreferences = {
  [K in keyof UserNotificationPreferences as UserNotificationPreferences[K] extends boolean ? K : never]: boolean;
};
type BooleanPreferenceKeys = 'notifyOnSend' | 'notifyOnReceive' | 'notifyOnWithdraw' | 'notifyOnDeposit' | 'notifyOnPaymentFailure';

@Component({
  selector: 'app-settings-notifications',
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.css']
})
export class SettingsNotificationsComponent implements OnInit {

  userNotificationPreferencesRequest: UserNotificationPreferencesRequest | undefined;
  userNotificationPreferences: UserNotificationPreferences = {
    notifyOnSend: true,
    notifyOnReceive: true,
    notifyOnWithdraw: true,
    notifyOnDeposit: false,
    notifyOnPaymentFailure: false
  };
  userInfo: UserInfo | undefined;
  isLoading = false;

  constructor(private userNotificationPreferencesService: UserNotificationPreferencesControllerService,
              private keycloakService: KeycloakService,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.getUserNotificationPreferences();
    this.userInfo = this.keycloakService.userInfo;
  }

  private getUserNotificationPreferences() {
    this.userNotificationPreferencesService.getNotificationPreferences()
        .subscribe({
          next: (response) => {
            this.userNotificationPreferences = response.data!;
          },
          error: (err) => {
            console.error(err);
            this.userNotificationPreferences = {
              notifyOnSend: true,
              notifyOnReceive: true,
              notifyOnWithdraw: true,
              notifyOnDeposit: false,
              notifyOnPaymentFailure: false
            };
          }
        });
  }

  protected updateUserNotificationPreferences() {
    this.isLoading = true;
    this.userNotificationPreferencesRequest = this.buildUserNotificationPreferencesRequest();
    this.userNotificationPreferencesService.updateNotificationPreferences({
      body: this.userNotificationPreferencesRequest as UserNotificationPreferencesRequest
    } )
        .subscribe({
          next: (response) => {
            this.userNotificationPreferences = response.data!;
            console.log(response);
            this.isLoading = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message});
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error});
          }
        });
  }

  onCheckboxChange(event: Event, field:BooleanPreferenceKeys) {
    const input = event.target as HTMLInputElement;
    (this.userNotificationPreferences[field] as boolean) = input.checked;
    console.log(this.userNotificationPreferences);
  }

  buildUserNotificationPreferencesRequest(): UserNotificationPreferencesRequest {
    return <UserNotificationPreferencesRequest>{
      notifyOnSend: this.userNotificationPreferences.notifyOnSend,
      notifyOnReceive: this.userNotificationPreferences.notifyOnReceive,
      notifyOnWithdraw: this.userNotificationPreferences.notifyOnWithdraw,
      notifyOnDeposit: this.userNotificationPreferences.notifyOnDeposit,
      notifyOnPaymentFailure: this.userNotificationPreferences.notifyOnPaymentFailure
    };
  }

}
