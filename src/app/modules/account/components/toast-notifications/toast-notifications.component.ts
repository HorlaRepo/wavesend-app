import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../../services/notification/notification.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-toast-notifications',
  templateUrl: './toast-notifications.component.html',
  styleUrls: ['./toast-notifications.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      transition('void => *', [
        animate('300ms ease-out', style({
          transform: 'translateY(0)',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        animate('200ms ease-in', style({
          transform: 'translateY(100%)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class ToastNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }
  
  closeNotification(id: number) {
    this.notificationService.removeNotification(id);
  }
  
  handleNotificationClick(notification: Notification) {
    if (notification.type === 'suggestion') {
      // Navigate to dashboard to view suggestions
      this.router.navigate(['/dashboard']);
    }
    
    this.notificationService.removeNotification(notification.id);
  }
}