import {Component, OnInit} from '@angular/core';
import { format } from 'date-fns';
import {UserInfo} from "../../../../services/keycloack/user-info";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {UserProfile} from "../../../../services/keycloack/user-profile";

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css']
})
export class SettingsProfileComponent implements OnInit{

  date: string = '';
  userInfo: UserInfo | undefined;
  userProfile: UserProfile | undefined;


  constructor(private keycloakService: KeycloakService) {

  }

  ngOnInit(): void {
    this.userInfo = this.keycloakService.userInfo;
    this.userProfile = this.keycloakService.profile;
    let dateOfBirth = this.userInfo?.dateOfBirth  as string;
    this.date = format(new Date(dateOfBirth), 'yyyy-MM-dd');
  }

}

