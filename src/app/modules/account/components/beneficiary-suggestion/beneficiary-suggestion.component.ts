import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { SuggestionStateService } from '../../../../services/ai/suggestion-state.service';
import { BeneficiaryAiSuggestion } from '../../../../services/models/beneficiary-ai-suggestion';

@Component({
  selector: 'app-beneficiary-suggestion',
  templateUrl: './beneficiary-suggestion.component.html',
  styleUrls: ['./beneficiary-suggestion.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({ 
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('active', style({ 
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => active', animate('400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')),
      transition('active => void', animate('300ms ease-in'))
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('highlight', style({ transform: 'scale(1.05)' })),
      transition('normal <=> highlight', animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'))
    ])
  ]
})
export class BeneficiarySuggestionComponent implements OnInit, OnDestroy {
  suggestions: BeneficiaryAiSuggestion[] = [];
  loading = false;
  activeSuggestionIndex = 0;
  animationState = 'active';
  pulseState = 'normal';
  private subscription: Subscription = new Subscription();
  
  constructor(
    private suggestionService: SuggestionStateService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.subscription.add(
      this.suggestionService.suggestions$.subscribe(suggestions => {
        this.suggestions = suggestions;
        if (suggestions.length > 0) {
          this.activeSuggestionIndex = 0;
          this.animationState = 'active';
          // Pulse effect when new suggestions arrive
          this.pulseEffect();
        }
      })
    );
    
    this.subscription.add(
      this.suggestionService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  get currentSuggestion(): BeneficiaryAiSuggestion | undefined {
    return this.suggestions[this.activeSuggestionIndex];
  }
  
  getInitials(name?: string): string {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    
    return name.charAt(0).toUpperCase();
  }
  
  checkForSuggestions() {
    this.suggestionService.checkForSuggestions().subscribe();
  }
  
  generateSuggestions() {
    this.suggestionService.generateSuggestions().subscribe();
  }
  
  dismissCurrentSuggestion() {
    const currentSuggestion = this.currentSuggestion;
    if (!currentSuggestion || !currentSuggestion.id) return;
    
    this.dismissSuggestion(currentSuggestion.id);
  }
  
  dismissSuggestion(suggestionId: number, event?: Event) {
    if (event) event.stopPropagation();
    
    this.suggestionService.dismissSuggestion(suggestionId).subscribe(() => {
      // If this was the last suggestion, animationState will get updated
      // when the suggestions$ observable emits
      if (this.suggestions.length <= 1) {
        this.animationState = 'void';
      } else if (this.activeSuggestionIndex >= this.suggestions.length - 1) {
        // If we're removing the last item in the list, go to the previous one
        this.activeSuggestionIndex = Math.max(0, this.activeSuggestionIndex - 1);
      }
    });
  }
  
  sendMoney(suggestion?: BeneficiaryAiSuggestion, event?: Event) {
    if (event) event.stopPropagation();
    if (!suggestion) return;
    
    // Navigate to transfer page with pre-filled values
    this.router.navigate(['/account/send-money'], {
      state: {
        beneficiaryId: suggestion.beneficiaryId,
        amount: suggestion.suggestedAmount,
        suggestedTransfer: true,
        beneficiaryName: suggestion.beneficiaryName
      }
    });
    
    // Dismiss the suggestion after taking action
    if (suggestion.id) {
      this.suggestionService.dismissSuggestion(suggestion.id).subscribe();
    }
  }
  
  nextSuggestion() {
    if (this.activeSuggestionIndex < this.suggestions.length - 1) {
      this.animationState = 'void';
      setTimeout(() => {
        this.activeSuggestionIndex++;
        this.animationState = 'active';
        this.pulseEffect();
      }, 200);
    }
  }
  
  previousSuggestion() {
    if (this.activeSuggestionIndex > 0) {
      this.animationState = 'void';
      setTimeout(() => {
        this.activeSuggestionIndex--;
        this.animationState = 'active';
        this.pulseEffect();
      }, 200);
    }
  }
  
  goToSuggestion(index: number) {
    if (index !== this.activeSuggestionIndex) {
      this.animationState = 'void';
      setTimeout(() => {
        this.activeSuggestionIndex = index;
        this.animationState = 'active';
        this.pulseEffect();
      }, 200);
    }
  }
  
  private pulseEffect() {
    this.pulseState = 'highlight';
    setTimeout(() => {
      this.pulseState = 'normal';
    }, 300);
  }
}