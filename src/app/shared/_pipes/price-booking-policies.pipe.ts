import { Pipe, PipeTransform } from '@angular/core';
import {BookingPolicies} from "../_models/itinerary.model";

@Pipe({
  name: 'priceBookingPolicies',
  standalone: true
})
export class PriceBookingPoliciesPipe implements PipeTransform {

  transform(price: number, bookingPolicies: BookingPolicies, quantity: number): number {
    if (!bookingPolicies) return 0;

    if(bookingPolicies?.advanceFullPayment) {
      return price * quantity;

    } else if (bookingPolicies?.advancePartialPaymentPercentage !== 0) {
      return price * quantity * bookingPolicies.advancePartialPaymentPercentage / 100;

    } else if (bookingPolicies?.depositRequiredAmount !== 0) {
      return bookingPolicies.depositRequiredAmount;

    } else if (bookingPolicies?.depositRequiredPercentage !== 0) {
      return price * quantity * bookingPolicies?.depositRequiredPercentage / 100;

    } else {
      return 0;
    }
  }

}
