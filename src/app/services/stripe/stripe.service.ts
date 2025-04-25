import { Injectable } from '@angular/core';
import { loadStripe } from "@stripe/stripe-js";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // Use environment variable for the key to easily switch between environments
  private stripePromise: Promise<any> = loadStripe(environment.stripePublishableKey);

  constructor() { }

  redirectToCheckout(sessionId: string) {
    console.log('Redirecting to checkout with session ID:', sessionId);
    
    this.stripePromise.then(stripe => {
      stripe.redirectToCheckout({ sessionId })
        .then(function (result: { error: { message: any; }; }) {
          if (result.error) {
            console.error('Stripe redirect error:', result.error);
            alert(result.error.message);
          }
        })
        .catch((error: any) => {
          console.error('Stripe redirect failed:', error);
          alert('Payment processing failed. Please try again later.');
        });
    });
  }
}