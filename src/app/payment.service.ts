import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private stripePromise: Promise<any> = loadStripe(environment.stripePublishableKey);

  constructor(private http: HttpClient) { }

  createPayment(amount: number, userEmail: string): any{
    return this.http.post<any>(`${environment.apiUrl}/payment/create-payment`, { amount, userEmail});
  }

  redirectToCheckout(sessionId: string) {
    this.stripePromise.then(stripe => {
      stripe.redirectToCheckout({ sessionId }).then(function (result: { error: { message: any; }; })  {
        if (result.error) {
          alert(result.error.message);
        }
      });
    });
  }
}
