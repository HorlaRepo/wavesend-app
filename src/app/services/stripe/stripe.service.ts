import { Injectable } from '@angular/core';
import {loadStripe} from "@stripe/stripe-js";

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private stripePromise: Promise<any> = loadStripe('pk_test_51OaEANBL7OKV3JrokH1Emj8BmIXB9suTSQUoVXJglIUJPsl4dpe1rTgYn4coKb5He89WcU3JK2ILrrH1IkQZ1wMf006DlQnQ57');


  constructor() { }


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
