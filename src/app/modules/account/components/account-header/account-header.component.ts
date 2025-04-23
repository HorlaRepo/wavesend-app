import { Component, HostListener, OnInit } from '@angular/core';
import { KeycloakService } from "../../../../services/keycloack/keycloak.service";
import { UserInfo } from "../../../../services/keycloack/user-info";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { UserProfileImageControllerService } from "../../../../services/services/user-profile-image-controller.service";
import { ProfileImageService } from "../../../../services/profile-image/profile-image.service";
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';





interface AppNotification {
  id: number;
  message: string;
  date: Date;
  read: boolean;
}

@Component({
  selector: 'app-account-header',
  templateUrl: './account-header.component.html',
  styleUrls: ['./account-header.component.css']
})
export class AccountHeaderComponent implements OnInit {

  user: UserInfo | undefined;
  profileImageUrl: SafeUrl | string = 'assets/images/user-profile.png';
  mobileMenuOpen = false;
  isScrolled = false;
  currentUrl: string = '';
  private routerSubscription: Subscription | undefined;


  notifications: AppNotification[] = [
    {
      id: 1,
      message: 'A new digital FIRC document is available for you to download',
      date: new Date('2025-04-05'),
      read: false
    },
    {
      id: 2,
      message: 'Updates to our privacy policy. Please read.',
      date: new Date('2025-04-01'),
      read: false
    },
    {
      id: 3,
      message: 'Update about WaveSend fees',
      date: new Date('2025-03-28'),
      read: true
    }
  ];


  constructor(
    private keycloakService: KeycloakService,
    private userProfileImageService: UserProfileImageControllerService,
    private sanitizer: DomSanitizer,
    private profileImageService: ProfileImageService,
    private router: Router
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.user = this.keycloakService.userInfo;
    this.profileImageService.profileImageUrl$.subscribe(url => {
      this.profileImageUrl = url;
    });
    this.profileImageUrl = await this.keycloakService.fetchUserProfileImage(this.profileImageUrl);
    this.profileImageService.setProfileImageUrl(this.profileImageUrl as string);

    this.currentUrl = this.router.url;
    console.log('Initial URL:', this.currentUrl);

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.urlAfterRedirects;
      console.log('URL changed to:', this.currentUrl);
    });


    // const linkColor = document.querySelectorAll('.nav-link');
    // linkColor.forEach(link => {
    //   if (window.location.href.endsWith(link.getAttribute('href') || '')) {
    //     link.classList.add('active')
    //   }
    //   link.addEventListener('click', () => {
    //     linkColor.forEach(nav => nav.classList.remove('active'));
    //     link.classList.add('active');
    //   })
    // });

  }

  get notificationCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  //Check if a route is active
  isRouteActive(route: string): boolean {
    // For logging/debugging
    
    // For the dashboard, which is at /account
    if (route === '/account/dashboard') {
      // Return true if the URL is exactly /account or /account/
      return this.currentUrl === '/account' || 
             this.currentUrl === '/account/' || 
             this.currentUrl === '/account/dashboard';
    }
    
    // For other routes, check if the current URL starts with the route
    // This keeps the tab active when viewing child routes
    if (route === '/account/send') {
      return this.currentUrl.startsWith('/account/send');
    } else if (route === '/account/withdraw') {
      return this.currentUrl.startsWith('/account/withdraw');
    } else if (route === '/account/deposit') {
      return this.currentUrl.startsWith('/account/deposit');
    } else if (route === '/account/transactions') {
      return this.currentUrl.startsWith('/account/transactions');
    }
    
    // Default exact matching
    return this.currentUrl === route;
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }


  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
      if (this.mobileMenuOpen) {
        menuToggle.classList.add('active');
      } else {
        menuToggle.classList.remove('active');
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 30;
    const header = document.querySelector('.account-header');
    if (header) {
      if (this.isScrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }


  async manageProfile() {
    console.log('Manage Profile')
    await this.keycloakService.keycloak.accountManagement();
  }

  async logout() {
    return this.keycloakService.logout()
  }

}


