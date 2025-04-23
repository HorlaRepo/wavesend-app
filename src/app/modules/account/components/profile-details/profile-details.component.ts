import {Component, OnInit} from '@angular/core';
import {UserProfile} from "../../../../services/keycloack/user-profile";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {UserInfo} from "../../../../services/keycloack/user-info";
import {UserProfileImageControllerService} from "../../../../services/services/user-profile-image-controller.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import { ChangeDetectorRef } from '@angular/core';
import {ProfileImageService} from "../../../../services/profile-image/profile-image.service";


@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit{

  userProfile: UserProfile | undefined;
  userInfo: UserInfo | undefined;
  profileImageUrl: SafeUrl | string = 'assets/images/user-profile.png';
  isUploading = false;
  currentFile?: File;


  constructor(private keycloakService: KeycloakService,
              private userProfileImageService: UserProfileImageControllerService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private profileImageService: ProfileImageService) {
  }

  async ngOnInit(): Promise<void> {
    this.userProfile = this.keycloakService.profile;
    this.userInfo = this.keycloakService.userInfo;
    this.profileImageUrl = await this.keycloakService.fetchUserProfileImage(this.profileImageUrl);
    console.log(this.profileImageUrl);
  }


  uploadUserProfileImage(file: File){
    this.isUploading = true;
    // const formData: FormData = new FormData();
    // formData.append('file', file, file.name);
    this.userProfileImageService.uploadUserProfileImage({
      body:{
        file: file
      }
    }).subscribe({
      next: async (data) => {
        this.profileImageUrl = await this.keycloakService.fetchUserProfileImage(this.profileImageUrl);
        this.profileImageService.setProfileImageUrl(this.profileImageUrl as string);
        this.isUploading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: async (err) => {
        this.isUploading = false;
        console.log(err.error.message)
        this.profileImageUrl = await this.keycloakService.fetchUserProfileImage(this.profileImageUrl);
        this.profileImageService.setProfileImageUrl(this.profileImageUrl as string);
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    })
  }

  onFileSelected(event: any) {
    this.currentFile = event.target.files.item(0);
    if (this.currentFile) {
      this.uploadUserProfileImage(this.currentFile);
    }
  }
}
