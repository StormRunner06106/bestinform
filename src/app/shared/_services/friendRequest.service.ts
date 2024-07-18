import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestService {

  // Functions For Changes Detection
  private listChanged = new BehaviorSubject(false);
  listChangedObs = this.listChanged.asObservable();

  // Trigger list changes
  triggerListChanges(message: boolean) {
    // Change the subject value
    this.listChanged.next(message);
  }

  constructor(private http: HttpClient) { }

  listMyFriend(page: number, size: number, sort?: string, dir?: string, filters?: object)   {
    return this.http.post('/bestinform/listMyFriend?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
  }

  rejectFriendRequest(friendRequestId : string, friendRequest:object) {
    return this.http.put('/bestinform/rejectFriendRequest?friendRequestId=' + friendRequestId, friendRequest);
  }

  acceptFriendRequest(friendRequestId: string, friendRequest:object) {
    return this.http.put('/bestinform/acceptFriendRequest?friendRequestId=' + friendRequestId, friendRequest);
  }

  sendFriendRequest(userId : string, friendRequest: object) {
    return this.http.post('/bestinform/sendFriendRequest?userId='+userId, friendRequest);
  }

  getFriendRequestById(friendRequestId: string) {
    return this.http.get('/bestinform/getFriendRequestById?friendRequestId=' + friendRequestId);
  }

  deleteFriend(friendRequestId: string) {
    return this.http.delete('/bestinform/deleteFriend?friendRequestId=' + friendRequestId);
  }
}
