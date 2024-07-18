import {Component, ViewEncapsulation} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-day-activities',
  templateUrl: './day-activities.component.html',
  styleUrls: ['./day-activities.component.scss'],
  encapsulation : ViewEncapsulation.None

})
export class DayActivitiesComponent {

  active = 1;
  activeTypeId=1;

  resDemo = [
    {
      id: '1',
      title: 'Le Fouget Restaurant',
      proReviewsPercentage: 100,
      address: 'Champs Elysees Boulevard',
      city: 'Paris',
      country: 'France',
      image: '/assets/images/others/itinerary-steps/eat-and-drinks-itineraries-min.jpg'
    },
    {
      id: '2',
      title: 'George V Caffe',
      proReviewsPercentage: 90,
      address: 'Champs Elysees Boulevard',
      city: 'Paris',
      country: 'France',
      image: '/assets/images/others/itinerary-steps/eat-and-drinks-itineraries-min.jpg'
    }
  ]

  constructor(private modalService: MatDialog) {
  }

  openModal(templateRef) {
    this.modalService.open(templateRef, {panelClass: 'custom-modal'});
  }

  checkRes(itemId: string) {
    console.log('check item');
  }

  closeModal() {
    this.modalService.closeAll();
  }
}
