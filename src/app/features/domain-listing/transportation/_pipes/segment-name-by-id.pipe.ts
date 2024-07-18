import { Pipe, PipeTransform } from '@angular/core';
import {Flight, FlightSegment} from "../_services/plane-flights.store";

@Pipe({
  name: 'segmentNameById'
})
export class SegmentNameByIdPipe implements PipeTransform {

  transform(itineraries: Flight['itineraries'], segmentId: string): string {
    let selectedSegment: FlightSegment;

    for (const itinerary of itineraries) {
      for (const segment of itinerary.segments) {
        if (segment.id === segmentId) {
          selectedSegment = segment;
          break;
        }
      }
    }

    return `${selectedSegment?.departure?.iataCode} - ${selectedSegment?.arrival?.iataCode}`;
  }

}
