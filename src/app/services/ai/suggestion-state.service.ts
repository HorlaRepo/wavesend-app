import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, tap, catchError, filter } from 'rxjs/operators';
import { BeneficiaryAiSuggestionControllerService } from '../services/beneficiary-ai-suggestion-controller.service';
import { BeneficiaryAiSuggestion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SuggestionStateService {
  private suggestionsSubject = new BehaviorSubject<BeneficiaryAiSuggestion[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private checkingInProgress = false;

  suggestions$ = this.suggestionsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private beneficiarySuggestionsApi: BeneficiaryAiSuggestionControllerService) {
    // Auto-check for suggestions every 5 minutes when user is active
    this.setupAutoCheck();
  }

  private setupAutoCheck() {
    // Only poll when tab is visible to save resources
    timer(0, 300000).pipe( // Initial check and then every 5 minutes
      filter(() => document.visibilityState === 'visible' && !this.checkingInProgress),
      switchMap(() => this.checkForSuggestions())
    ).subscribe();
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