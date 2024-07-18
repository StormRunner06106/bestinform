import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PlaneService {

  public calculateDurationFromItinerary(itinerary: any) {
    const durations = itinerary.segments.map(s => s.duration);
    let hours = 0;
    let minutes = 0;
    durations.forEach(d => {
      minutes += +d?.split('H').pop()?.split('M')[0] || 0;
      hours += +d?.split('PT').pop()?.split('H')[0] || 0;
    });
    if (minutes >= 60) {
      const extra = Math.floor(minutes / 60);
      minutes = minutes % 60;
      hours += extra;
    }

    return `${hours}h ${minutes}min`;
  }
}
