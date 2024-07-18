import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-route-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-modal.component.html',
  styleUrls: ['./route-modal.component.scss']
})
export class RouteModalComponent {

  @Output() closeEmit: EventEmitter<any> = new EventEmitter();

  constructor(private modalRef:NgbActiveModal) {
  }
  close(accept:boolean){
    this.modalRef.close();
    if(accept){
      return true;
    }else{
      return false
    }


    // this.closeEmit.emit(false);
  }

  confirm(){
    this.modalRef.close();
    this.closeEmit.emit();
  }
}
