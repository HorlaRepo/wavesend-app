import { Component, OnInit } from '@angular/core';
import { UserProfile } from "../../../../services/keycloack/user-profile";
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { UserInfo } from "../../../../services/keycloack/user-info";
import { UserProfileImageControllerService } from "../../../../services/services/user-profile-image-controller.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ChangeDetectorRef } from '@angular/core';
import { ProfileImageService } from "../../../../services/profile-image/profile-image.service";


@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {

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


  uploadUserProfileImage(file: File) {
    this.isUploading = true;
    // Store the current image URL as backup
    const previousImageUrl = this.profileImageUrl;

    this.userProfileImageService.uploadUserProfileImage({
      body: {
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
      error: (err) => {
        this.isUploading = false;
        console.log('Profile image upload failed:', err.error?.message || 'Unknown error');

        // Immediately set to default image instead of trying to fetch again
        if (typeof this.profileImageUrl === 'string' &&
          !this.profileImageUrl.includes('data:image')) {
          // Only reset if it's not already a data URL
          this.profileImageUrl = 'assets/images/user-profile.png';
        } else {
          // Keep the previous image if it was valid
          this.profileImageUrl = previousImageUrl;
        }

        // Update the service with the default image
        this.profileImageService.setProfileImageUrl(
          typeof this.profileImageUrl === 'string' ?
            this.profileImageUrl : 'assets/images/user-profile.png'
        );

        // Force UI update
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    });
  }

  onFileSelected(event: any) {
    this.currentFile = event.target.files.item(0);
    if (this.currentFile) {
      this.uploadUserProfileImage(this.currentFile);
    }
  }
}
