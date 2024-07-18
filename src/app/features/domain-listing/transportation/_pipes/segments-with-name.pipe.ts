import { Pipe, PipeTransform } from '@angular/core';
import {FlightOfferWithBags} from "../_services/selected-flight.store";

@Pipe({
  name: 'segmentsWithName'
})
export class SegmentsWithNamePipe implements PipeTransform {

  transform(flightOfferWithBags: FlightOfferWithBags, segmentsArray: string[]): string {
    let outputString = '';

    for (const itinerary of flightOfferWithBags.flightOffer.itineraries) {
      for (const segment of itinerary.segments) {
        if (segmentsArray.includes(segment.id)) {
          outputString += segment.originLocation.cityNameEn + ' - ' + segment.destinationLocation.cityNameEn + ', ';
        }
      }
    }

    return outputString;
  }

}
