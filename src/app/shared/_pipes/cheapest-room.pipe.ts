import { Pipe, PipeTransform } from '@angular/core';
import {TripRoom} from "../_models/trip.model";

@Pipe({
  name: 'cheapestRoom',
  standalone: true
})
export class CheapestRoomPipe implements PipeTransform {

  transform(rooms: TripRoom[]): number {
    if (!rooms || rooms.length === 0) return;
    let cheapestRoom = rooms[0].price;
    rooms.forEach( room => {
      if (room.price < cheapestRoom) cheapestRoom = room.price;
    });
    return cheapestRoom;
  }

}
