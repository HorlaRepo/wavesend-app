import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription, interval } from 'rxjs';
import { SuggestionStateService } from 'src/app/services/ai/suggestion-state.service';
import { BeneficiaryAiSuggestion } from 'src/app/services/models/beneficiary-ai-suggestion';
import { Router } from '@angular/router';
import { AiFinancialAssistantControllerService } from 'src/app/services/services/ai-financial-assistant-controller.service';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  displayText?: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-floating-suggestion',
  templateUrl: './floating-suggestion.component.html',
  styleUrls: ['./floating-suggestion.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in'))
    ]),
    trigger('cardTransition', [
      state('void', style({ opacity: 0, transform: 'translateX(50px)' })),
      state('active', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => active', animate('300ms ease-out')),
      transition('active => void', animate('200ms ease-in'))
    ]),
    trigger('messageAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => visible', animate('200ms ease-out')),
      transition('visible => void', animate('150ms ease-in'))
    ])
  ]
})
export class FloatingSuggestionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;
  
  @Input() autoRotate = true;
  @Input() autoRotateInterval = 8000; // 8 seconds
  @Output() suggestionAction = new EventEmitter<{ action: string, suggestion: BeneficiaryAiSuggestion }>();

  // Suggestions tab properties
  suggestions: BeneficiaryAiSuggestion[] = [];
  loading = false;
  activeSuggestionIndex = 0;
  animationState = 'visible';
  cardState = 'active';
  isExpanded = true;
  noSuggestionsState: 'empty' | 'loading' | 'error' = 'empty';
  errorMessage: string = '';
  typingText: string = '';
  fullText: string = '';
  typingSpeed: number = 30;

  // Chat tab properties
  activeTab: 'suggestions' | 'chat' = 'suggestions';
  chatMessages: ChatMessage[] = [];
  userInput: string = '';
  isAiTyping = false;
  unreadMessages = 0;
  showLatestTyping = false;

  private subscription: Subscription = new Subscription();
  private autoRotateSubscription: Subscription | null = null;
  private scrollToBottomPending = false;

  constructor(
    private suggestionService: SuggestionStateService,
    private aiAssistantService: AiFinancialAssistantControllerService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.suggestionService.suggestions$.subscribe(suggestions => {
        const hadSuggestions = this.suggestions.length > 0;
        this.suggestions = suggestions;

        if (suggestions.length > 0) {
          // Only reset to first suggestion if we didn't already have suggestions
          if (!hadSuggestions) {
            this.activeSuggestionIndex = 0;
            this.animationState = 'visible';
            this.noSuggestionsState = 'empty'; // Reset state

            // Start typing animation when suggestions are loaded
            if (this.currentSuggestion) {
              this.startTypingAnimation(
                this.currentSuggestion.suggestionText || 'Based on your previous transactions with ' +
                this.currentSuggestion.beneficiaryName +
                ', we suggest sending $' +
                this.currentSuggestion.suggestedAmount!.toFixed(2) +
                ' to them.'
              );
            }
          }

          // Start auto-rotation if enabled and we have multiple suggestions
          if (this.autoRotate && suggestions.length > 1) {
            this.startAutoRotate();
          }
        } else if (!this.loading) {
          // Only set to empty if we're not loading
          this.noSuggestionsState = 'empty';
          this.animationState = 'visible'; // Keep the container visible but show empty state
          this.stopAutoRotate();
        }
      })
    );

    this.subscription.add(
      this.suggestionService.loading$.subscribe(loading => {
        this.loading = loading;
        if (loading) {
          this.noSuggestionsState = 'loading';
          this.animationState = 'visible';
        } else if (this.suggestions.length === 0) {
          this.noSuggestionsState = 'empty';
        }
      })
    );
  }

  ngAfterViewChecked() {
    if (this.scrollToBottomPending) {
      this.scrollToBottom();
      this.scrollToBottomPending = false;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoRotate();
  }

  // Scroll chat container to bottom
  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Switch between tabs
  switchTab(tab: 'suggestions' | 'chat'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      
      if (tab === 'chat') {
        this.unreadMessages = 0;
        setTimeout(() => {
          this.scrollToBottom();
          if (this.chatInput) {
            this.chatInput.nativeElement.focus();
          }
        }, 0);
      }
    }
  }

  // Chat functionality
  sendUserMessage(event?: Event): void {
    // If the event is a keyboard event, check if it's Enter and prevent default
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
    }
    
    const message = this.userInput.trim();
    if (!message || this.isAiTyping) return;
    
    // Add user message
    this.chatMessages.push({
      text: message,
      sender: 'user',
      timestamp: new Date()
    });
    
    // Clear input
    this.userInput = '';
    this.scrollToBottomPending = true;
    
    // Set typing state
    this.isAiTyping = true;
    
    // Send to backend
    this.aiAssistantService.processMessage({ body: { message } }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.addAiMessage(response.data);
        } else {
          this.addAiMessage("I'm sorry, I couldn't process your request. Please try again.");
        }
      },
      error: (error) => {
        console.error('Error processing message:', error);
        this.addAiMessage("Sorry, I encountered an error. Please try again later.");
        this.isAiTyping = false;
      }
    });
  }
  
  addAiMessage(text: string): void {
    const newMessage: ChatMessage = {
      text: text,
      displayText: '',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    
    this.chatMessages.push(newMessage);
    this.scrollToBottomPending = true;
    this.showLatestTyping = true;
    
    // Animate typing effect
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        newMessage.displayText = text.substring(0, charIndex + 1);
        charIndex++;
        this.scrollToBottomPending = true;
      } else {
        clearInterval(typingInterval);
        newMessage.isTyping = false;
        this.isAiTyping = false;
        this.showLatestTyping = false;
        
        // Increment unread count if not on chat tab
        if (this.activeTab !== 'chat') {
          this.unreadMessages++;
        }
      }
    }, 20); // Adjust typing speed as needed
  }
  
  clearChat(): void {
    // Clear frontend chat history
    this.chatMessages = [];
    
    // Clear backend conversation context
    this.aiAssistantService.clearConversation().subscribe({
      next: (response) => {
        console.log('Conversation cleared successfully');
      },
      error: (error) => {
        console.error('Error clearing conversation:', error);
      }
    });
  }
  
  usePrompt(promptText: string): void {
    this.userInput = promptText;
    setTimeout(() => {
      this.sendUserMessage();
    }, 100);
  }

  private updateAnimationState(state: 'visible' | 'void'): void {
    this.animationState = state;
  }

  // Add method to generate new suggestions
  refreshSuggestions() {
    this.noSuggestionsState = 'loading';
    this.suggestionService.checkForSuggestions().subscribe({
      next: (suggestions) => {
        // The suggestions$ observable will pick up the new suggestions
        if (suggestions.length === 0) {
          this.noSuggestionsState = 'empty';
        }
      },
      error: (err) => {
        this.noSuggestionsState = 'error';
        this.errorMessage = 'Unable to load suggestions.';
        console.error('Error loading suggestions:', err);
      }
    });
  }

  generateNewSuggestions() {
    this.noSuggestionsState = 'loading';
    this.suggestionService.generateSuggestions().subscribe({
      next: () => {
        // The suggestions$ observable will pick up the new suggestions
      },
      error: (err) => {
        this.noSuggestionsState = 'error';
        this.errorMessage = 'Unable to generate suggestions.';
        console.error('Error generating suggestions:', err);
      }
    });
  }

  startTypingAnimation(text: string): void {
    this.fullText = text || 'Based on your previous transactions';
    this.typingText = '';

    const typeNextChar = () => {
      if (this.typingText.length < this.fullText.length) {
        this.typingText += this.fullText.charAt(this.typingText.length);
        setTimeout(typeNextChar, this.typingSpeed);
      }
    };

    setTimeout(typeNextChar, 300); // Start typing after a short delay
  }

  private resetCardWithAnimation(): void {
    this.cardState = 'void';

    setTimeout(() => {
      this.cardState = 'active';
      // Start typing animation when card becomes active
      if (this.currentSuggestion) {
        this.startTypingAnimation('Based on your previous transactions with ' +
          this.currentSuggestion.beneficiaryName +
          ', we suggest sending $' +
          this.currentSuggestion.suggestedAmount!.toFixed(2) +
          ' to them.');
      }
    }, 200);
  }

  get currentSuggestion(): BeneficiaryAiSuggestion | undefined {
    return this.suggestions[this.activeSuggestionIndex];
  }

  get hasSuggestions(): boolean {
    return this.suggestions.length > 0;
  }

  get hasMultipleSuggestions(): boolean {
    return this.suggestions.length > 1;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;

    // If expanded and on chat tab, focus input
    if (this.isExpanded && this.activeTab === 'chat') {
      setTimeout(() => {
        if (this.chatInput) {
          this.chatInput.nativeElement.focus();
        }
        this.scrollToBottom();
      }, 0);
    }

    // If collapsed, stop auto-rotate; if expanded, restart if needed
    if (!this.isExpanded) {
      this.stopAutoRotate();
    } else if (this.autoRotate && this.hasMultipleSuggestions && this.activeTab === 'suggestions') {
      this.startAutoRotate();
    }
  }

  getInitials(name?: string): string {
    if (!name) return '?';

    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  }

  dismissCurrentSuggestion() {
    const currentSuggestion = this.currentSuggestion;
    if (!currentSuggestion || !currentSuggestion.id) return;

    this.dismissSuggestion(currentSuggestion.id);
  }

  dismissSuggestion(suggestionId: number, event?: Event) {
    if (event) event?.stopPropagation();

    this.cardState = 'void';

    setTimeout(() => {
      this.suggestionService.dismissSuggestion(suggestionId).subscribe(() => {
        if (this.suggestions.length <= 1) {
          this.animationState = 'void';
        } else {
          this.cardState = 'active';

          // If we're removing the last item or current one, go to the previous one
          if (this.activeSuggestionIndex >= this.suggestions.length - 1) {
            this.activeSuggestionIndex = Math.max(0, this.activeSuggestionIndex - 1);
          }
        }
      });
    }, 200);
  }

  sendMoney(suggestion?: BeneficiaryAiSuggestion, event?: Event) {
    if (event) event?.stopPropagation();
    if (!suggestion) return;

    this.suggestionAction.emit({ action: 'send', suggestion });

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

  nextSuggestion(event?: Event): void {
    if (event) event?.stopPropagation();

    if (this.activeSuggestionIndex < this.suggestions.length - 1) {
      this.activeSuggestionIndex++;
      this.resetCardWithAnimation();
      this.resetAutoRotateTimer();
    }
  }

  previousSuggestion(event?: Event): void {
    if (event) event?.stopPropagation();

    if (this.activeSuggestionIndex > 0) {
      this.activeSuggestionIndex--;
      this.resetCardWithAnimation();
      this.resetAutoRotateTimer();
    }
  }

  private startAutoRotate(): void {
    this.stopAutoRotate();

    if (this.suggestions.length > 1 && this.activeTab === 'suggestions') {
      this.autoRotateSubscription = interval(this.autoRotateInterval).subscribe(() => {
        if (this.isExpanded) {
          this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.suggestions.length;
          this.resetCardWithAnimation(); // Use this instead of directly setting cardState
        }
      });
    }
  }

  private stopAutoRotate() {
    if (this.autoRotateSubscription) {
      this.autoRotateSubscription.unsubscribe();
      this.autoRotateSubscription = null;
    }
  }

  private resetAutoRotateTimer() {
    if (this.autoRotate && this.hasMultipleSuggestions && this.activeTab === 'suggestions') {
      this.stopAutoRotate();
      this.startAutoRotate();
    }
  }
}