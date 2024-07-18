import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-suggested-gps-location',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './suggested-gps-location.component.html',
  styleUrls: ['./suggested-gps-location.component.scss']
})
export class SuggestedGPSLocationComponent {
  
  constructor(public modal: NgbActiveModal,
    ) {
  }

  closeModal(){
    this.modal.close();
    }
}
