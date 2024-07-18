import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe } from '@stripe/stripe-js';
import { tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent {
  @Input() set sessionId(session: string) {
    this.session = session;
    this.invokeStripe();
  }

  stripe: any;
  session: string;
  clientSecret: string;
  showPreloader = true;
  error = false;

  constructor(private http: HttpClient) {}

  async invokeStripe() {
    if (!this.stripe) {
      this.stripe = await loadStripe('pk_test_51P3aQlEZiUKGHZHXcwyzKHrjrfwvPR55C3GpZpna3IsqvH6Z9GcAaB2fkOsjW1MOrmnP1kXUSm35sgHYaiu9Bctt00kkwu7Y1A');
    }
    this.preparePayment().subscribe(() => {
      this.initialize();
    });
  }

  preparePayment() {
    return this.http.post<any>(
        `/bestinform/executeOneEmbeddedTimePaymentReservation?reservationId={this.session}`,
        {id: this.session}
    ).pipe(tap(data => {
      if (data?.errorData) {
        this.error = true;
      } else {
        this.clientSecret = data?.clientSecret;
        this.showPreloader = false;
      }
    }),map(key => key?.clientSecret));
  }
  async initialize() {
    const checkout = await this.stripe.initEmbeddedCheckout({
      clientSecret: this.clientSecret,
      onComplete: (data) => {
        console.log('completed payment', data);
      }
    });
    checkout.mount('#checkout');
  }
}
