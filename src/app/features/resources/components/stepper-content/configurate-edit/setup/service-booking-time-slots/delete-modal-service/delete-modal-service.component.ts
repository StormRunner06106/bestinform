import {Component, Inject, OnInit} from '@angular/core';
import {ProductListService} from "../../../../../../_services/product-list.service";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BookingTimeslotsService} from "../../../../../../_services/booking-timeslots.service";

@Component({
  selector: 'app-delete-modal-service',
  templateUrl: './delete-modal-service.component.html',
  styleUrls: ['./delete-modal-service.component.scss']
})
export class DeleteModalServiceComponent implements OnInit {

  currentService: any;

  constructor(private timeslotService: BookingTimeslotsService,
              private resourceService: ResourcesService,
              public dialogRef: MatDialogRef<DeleteModalServiceComponent>,
              @Inject(MAT_DIALOG_DATA) public serviceData: { service: any, index: number }) {
  }

  ngOnInit() {
    this.currentService = this.serviceData.service;
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteService() {
    if (this.resourceService.resourceId$.getValue()) {
      console.log('sunt pe edit res si vreau sa sterg');
      //EDIT RESOURCE
      //delete a product just added
      if (this.serviceData.service.state === 'add') {
        const serviceList = this.timeslotService.serviceList$.getValue()

        // Exclude the room by id
        const filteredList = serviceList.filter(service => service.id !== this.serviceData.service.id);

        // Check if a room was deleted and update the array
        if (filteredList.length !== serviceList.length) {
          this.timeslotService.serviceList$.next(filteredList);
          this.timeslotService.refreshServiceList$.next(true);
          this.close();
        } else {
          console.log(`serv not found`);

        }
      }else{
        //move the prod to delete array

        const serviceList = this.timeslotService.serviceList$.getValue()

        // Exclude the prod by id
        const filteredService= serviceList.filter(prod => prod.id !== this.serviceData.service.id);

        // Check if a prod was deleted and update the array
        if (filteredService.length !== serviceList.length) {
          this.timeslotService.serviceList$.next(filteredService);
          this.timeslotService.addServiceToDeleteList(this.serviceData.service);
          console.log('DELETE ARRAY', this.timeslotService.deleteServiceList$.getValue());
          this.timeslotService.refreshServiceList$.next(true);
          this.close();
        }
      }
    } else {
      console.log('sunt pe add res si vreau sa sterg');
      //ADD RESOURCE
      // Get products list
      const serviceList = this.timeslotService.serviceList$.getValue()

      // Exclude the ticket by id
      const filteredServices = serviceList.filter(product => product.id !== this.serviceData.service.id);

      // Check if a room was deleted and update the array
      if (filteredServices.length !== serviceList.length) {
        this.timeslotService.serviceList$.next(filteredServices);
        this.close();
      } else {
        console.log(`Prod not found`);
      }
    }
  }

}
