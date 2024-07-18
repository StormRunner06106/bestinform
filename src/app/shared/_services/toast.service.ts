import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  toastEvents: Observable<any>;
  private _toastEvents = new Subject<any>();

  constructor() {
    this.toastEvents = this._toastEvents.asObservable();
  }

  showToast(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info', hidden?: boolean) {
    this._toastEvents.next({
      message,
      title,
      type: type,
      hidden
    });
  }
}
