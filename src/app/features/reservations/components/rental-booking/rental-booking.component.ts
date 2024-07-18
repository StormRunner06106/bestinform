import {Component, Input, OnChanges} from '@angular/core';
import {Reservation} from 'src/app/shared/_models/reservation.model';
import {ResourcesService} from "../../../../shared/_services/resources.service";

@Component({
    selector: 'app-rental-booking',
    templateUrl: './rental-booking.component.html',
    styleUrls: ['./rental-booking.component.scss']
})
export class RentalBookingComponent implements OnChanges {
    @Input() reservation: Reservation;

    rentalBooking: Reservation['rentalBooking'];
    checkIn: string;
    checkOut: string;
    lengthOfStay = 0;
    totalRooms = 0;

    constructor(private resourcesServices: ResourcesService) {

    }

    ngOnChanges(): void {
        this.getRentalBookingData();
    }

    getRentalBookingData() {
        this.rentalBooking = this.reservation.rentalBooking;

        this.rentalBooking.items.forEach((item: any) => {
            this.resourcesServices.getRoomById(item.itemId).subscribe((resp: any) => {
                item.name = resp.name; // Add itemName property to the item object
                console.log('camera', resp);
                console.log('tot', this.rentalBooking);
            })
        })

        //set check-in date
        this.checkIn = this.reservation?.rentalBooking?.start !== null ? this.reservation?.rentalBooking?.start : '';
        //check-out date
        this.checkOut = this.reservation?.rentalBooking?.end !== null ? this.reservation?.rentalBooking?.end : '';

        if (this.checkIn && this.checkOut) {
            this.calculateNoOfDays(this.checkIn, this.checkOut);
        }

        this.totalRooms = this.reservation?.rentalBooking?.items ? this.reservation?.rentalBooking?.items.length : 0;
    }

    //calculate the number of dayes between check-in - check-out
    calculateNoOfDays(startData, endData) {
        if ((startData !== undefined && endData !== undefined) || (startData !== null && endData !== null)) {
            //check-in data
            const a = new Date(startData);
            //check-out data
            const b = new Date(endData);
            //calculate num of days

            this.lengthOfStay = Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / (1000 * 60 * 60 * 24))
        } else {
            this.lengthOfStay = 0;
        }
    }

}
