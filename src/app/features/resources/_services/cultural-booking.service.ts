import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CulturalRoom} from "../../../shared/_models/cultural-room.model";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CulturalBookingService {

  constructor(private http: HttpClient) { }

  culturalRoom$ = new BehaviorSubject<CulturalRoom>(null);


  culturalRoomData() {
    return this.culturalRoom$.asObservable();
  }

  //------------------REQUESTS------------------
  createCulturalRoom(resourceId: string, culturalRoom: CulturalRoom) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createCulturalRoom?resourceId=' + resourceId, culturalRoom);
  }

  updateCulturalRoom(culturalRoomId: string, newCulturalRoom: CulturalRoom) {
    return this.http.put<{success: boolean, reason: string}>('/bestinform/updateCulturalRoom?culturalRoomId=' + culturalRoomId, newCulturalRoom);
  }

  getResourceCulturalRooms(resourceId: string) {
    return this.http.get<CulturalRoom[]>('/bestinform/getResourceCulturalRooms?resourceId=' + resourceId);
  }

  getCulturalRoomById(culturalRoomId: string) {
    return this.http.get<CulturalRoom>('/bestinform/getCulturalRoomById?culturalRoomId=' + culturalRoomId);
  }

  deleteCulturalRoom(culturalRoomId: string) {
    return this.http.delete<{success: boolean, reason: string}>('/bestinform/deleteCulturalRoom?culturalRoomId=' + culturalRoomId);
  }
}
