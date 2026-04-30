import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer, Subscription } from 'rxjs';
import { switchMap, tap, catchError, filter } from 'rxjs/operators';
import { BeneficiaryAiSuggestionControllerService } from '../services/beneficiary-ai-suggestion-controller.service';
import { BeneficiaryAiSuggestion } from '../models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuggestionStateService {
  private suggestionsSubject = new BehaviorSubject<BeneficiaryAiSuggestion[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private checkingInProgress = false;
  private pollSubscription: Subscription | null = null;

  suggestions$ = this.suggestionsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private beneficiarySuggestionsApi: BeneficiaryAiSuggestionControllerService,
    private authService: AuthService
  ) {
    // Start polling only when authenticated; stop when logged out
    this.authService.authStatus$.subscribe(authenticated => {
      if (authenticated) {
        this.startAutoCheck();
      } else {
        this.stopAutoCheck();
        this.suggestionsSubject.next([]);
      }
    });
  }

  private startAutoCheck() {
    if (this.pollSubscription) return;
    this.pollSubscription = timer(0, 300000).pipe(
      filter(() => document.visibilityState === 'visible' && !this.checkingInProgress),
      switchMap(() => this.checkForSuggestions())
    ).subscribe();
  }

  private stopAutoCheck() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  checkForSuggestions(): Observable<BeneficiaryAiSuggestion[]> {
    if (this.checkingInProgress) {
      return this.suggestions$;
    }
    
    this.loadingSubject.next(true);
    this.checkingInProgress = true;
    
    // Using your OpenAPI generated service
    return this.beneficiarySuggestionsApi.getUserSuggestions().pipe(
      tap(response => {
        if (response.success && response.data) {
          console.log('Fetched suggestions:', response.data);
          this.suggestionsSubject.next(response.data);
        }
        this.checkingInProgress = false;
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error fetching suggestions:', error);
        this.checkingInProgress = false;
        this.loadingSubject.next(false);
        return of({ success: false, data: [] });
      }),
      switchMap(response => of(response.data || []))
    );
  }

  generateSuggestions(): Observable<any> {
    this.loadingSubject.next(true);
    
    // Using your OpenAPI generated service
    return this.beneficiarySuggestionsApi.generateSuggestions().pipe(
      tap(response => {
        this.loadingSubject.next(false);
        // After generating suggestions, check for them in 3 seconds
        setTimeout(() => this.checkForSuggestions().subscribe(), 3000);
      }),
      catchError(error => {
        console.error('Error generating suggestions:', error);
        this.loadingSubject.next(false);
        return of({ success: false, message: 'Failed to generate suggestions' });
      })
    );
  }

  dismissSuggestion(suggestionId: number): Observable<any> {
    // Using your OpenAPI generated service
    return this.beneficiarySuggestionsApi.dismissSuggestion({ suggestionId }).pipe(
      tap(response => {
        // Remove the dismissed suggestion from the current list
        if (response.success) {
          const currentSuggestions = this.suggestionsSubject.getValue();
          const updatedSuggestions = currentSuggestions.filter(s => s.id !== suggestionId);
          this.suggestionsSubject.next(updatedSuggestions);
        }
      }),
      catchError(error => {
        console.error('Error dismissing suggestion:', error);
        return of({ success: false, message: 'Failed to dismiss suggestion' });
      })
    );
  }

  clearSuggestions() {
    this.suggestionsSubject.next([]);
  }
}