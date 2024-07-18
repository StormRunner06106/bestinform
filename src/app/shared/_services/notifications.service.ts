import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {GenericPagination} from "../_models/generic-pagination.model";
import {Notification} from "../_models/notification.model";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // Functions For Changes Detection
  private listChanged = new BehaviorSubject(false);
  listChangedObs = this.listChanged.asObservable();

  // Trigger list changes
  triggerUserListChanges(message: boolean) {
    // Change the subject value
    this.listChanged.next(message);
  }

  //tot http trebuie?
  constructor(private http: HttpClient) { 

  }

    //list notifications 
    listMyNotifications(page: number, size: number, sort?: string, dir?: string) {
      return this.http.post<GenericPagination<Notification>>('/bestinform/listMyNotifications?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, {});
    }  

    //markNotificationAsRead
    markNotificationAsRead(notificationId : string) {
      return this.http.put('/bestinform/markNotificationAsRead?notificationId=' + notificationId, {});
    }

    //MarkAllMyNotificationAsRead
    markAllNotificationAsRead() {
      return this.http.put('/bestinform/markAllMyNotificationAsRead',{});
    }

    //createNotification
    createNotification(notificationObj: object) {
      return this.http.post('/bestinform/createNotification', notificationObj);
    }

    //getNotificationById
    getNotificationById(notificationId: string) {
      return this.http.get('/bestinform/getNotificationById?notificationId=' + notificationId);
    }

    //deleteNotification
    deleteNotification(notificationId: string) {
      return this.http.delete('/bestinform/deleteNotification?notificationId=' + notificationId);
    }

    //deleteAllMyNotification
    deleteAllMyNotification() {
      return this.http.delete('/bestinform/deleteAllMyNotification');
    }
}
