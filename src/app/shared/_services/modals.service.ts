import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ModalService{

  elementId: string;
  elementInfo: string;

  // Functions For Changes Detection
  private listChanged = new BehaviorSubject(false);
  listChangedObs = this.listChanged.asObservable();

  // Trigger list changes
  triggerUserListChanges(message: boolean) {

    // Change the subject value
    this.listChanged.next(message);
  }

  // Set the element id
  setElementId(elementId: string) {
    this.elementId = elementId;
  }

  setElementInfo(elementInfo: string){
    this.elementInfo= elementInfo;
  }

  // Return the element id value
  getElementId() {
    return this.elementId;
  }

  getElementInfo(){
    console.log('element info', this.elementInfo);
    return this.elementInfo;
  }

}
