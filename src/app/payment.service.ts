import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private stripePromise: Promise<any> = loadStripe('pk_test_51OaEANBL7OKV3JrokH1Emj8BmIXB9suTSQUoVXJglIUJPsl4dpe1rTgYn4coKb5He89WcU3JK2ILrrH1IkQZ1wMf006DlQnQ57');

  constructor(private http: HttpClient) { }

  createPayment(amount: number, userEmail: string): any{
    return this.http.post<any>('http://localhost:8080/api/v1/payment/create-payment', { amount, userEmail});
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
