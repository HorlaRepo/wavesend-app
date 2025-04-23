import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SuggestionStateService } from '../ai/suggestion-state.service';

export interface Notification {
  id: number;
  type: 'suggestion' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;
  
  notifications$ = this.notifications.asObservable();
  
  constructor(private suggestionService: SuggestionStateService) {
    // Listen for new suggestions and create notifications
    this.suggestionService.suggestions$.subscribe(suggestions => {
      // Only show notifications for new suggestions
      const newSuggestions = suggestions.filter(s => !s.seen);
      if (newSuggestions.length > 0) {
        this.showSuggestionNotification(newSuggestions.length);
      }
    });
  }
  
  showSuggestionNotification(count: number) {
    this.addNotification({
      type: 'suggestion',
      title: 'Friend Suggestion',
      message: count === 1 
        ? 'One of your friends might need help' 
        : `${count} of your friends might need help`,
      data: { suggestionsCount: count }
    });
  }
  
  addNotification(notification: Omit<Notification, 'id'>) {
    const newNotification = { ...notification, id: this.nextId++ };
    const current = this.notifications.getValue();
    this.notifications.next([...current, newNotification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => this.removeNotification(newNotification.id), 5000);
  }
  
  removeNotification(id: number) {
    const current = this.notifications.getValue();
    this.notifications.next(current.filter(n => n.id !== id));
  }
}