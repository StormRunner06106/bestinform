import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject, switchMap, takeUntil} from "rxjs";
import {BookingTypeItemsService, SelectedSeat} from "../booking-type-items.service";
import {CulturalRoom} from "../../../../../shared/_models/cultural-room.model";
import {ToastService} from "../../../../../shared/_services/toast.service";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {AccommodationItem} from "../../../../../shared/_models/itinerary.model";
import {Resource} from "../../../../../shared/_models/resource.model";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss']
})
export class SeatSelectionComponent implements OnInit, OnDestroy {

  resourceData: Resource = null;

  culturalRoom: CulturalRoom = null;
  selectedSeats: SelectedSeat[] = [];
  totalPrice = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(private bookingItemsService: BookingTypeItemsService,
              private toastService: ToastService,
              private router: Router,
              private route: ActivatedRoute,
              private resourceFilterService: ResourceFilterService,) {
  }

  ngOnInit(): void {
    this.getCulturalRoomData();
  }

  getCulturalRoomData() {
    this.bookingItemsService.getResourceCulturalRooms()
        .pipe(
            map(culturalRooms => culturalRooms[0]),
            takeUntil(this.ngUnsubscribe)
        )
        .subscribe({
          next: res => {
            this.culturalRoom = res;

            this.listenForResource();
          },

          error: () => {
            this.toastService.showToast(
                'error',
                'No tickets information was found',
                'error'
            );
          }
        });
  }

  listenForResource() {


    this.resourceFilterService.resourceObs$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
      next: res => {

        this.resourceData = {...res};

      }
    });
  }

  handleSeatSelection(event: SelectedSeat[]) {
    this.totalPrice = 0;
    this.selectedSeats = [...event];

    if (this.selectedSeats.length > 0) {
      this.selectedSeats.forEach( seat => {
        this.totalPrice += this.getCulturalRoomSeatPrice(seat);
      });
    }
  }

  getCulturalRoomSeatPrice(seat: SelectedSeat): number {
    if (!this.resourceData.bookingPolicies) return 0;

    if(this.resourceData.bookingPolicies?.advanceFullPayment) {
      return seat.price;

    } else if (this.resourceData?.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
      return seat.price * this.resourceData?.bookingPolicies?.advancePartialPaymentPercentage / 100;

    } else if (this.resourceData?.bookingPolicies?.depositRequiredAmount !== 0) {
      return this.resourceData?.bookingPolicies?.depositRequiredAmount;

    } else if (this.resourceData?.bookingPolicies?.depositRequiredPercentage !== 0) {
      return seat.price * this.resourceData.bookingPolicies?.depositRequiredPercentage / 100;

    } else {
      return 0;
    }

  }

  confirmSeats() {
    this.bookingItemsService.setSelectedSeats(this.selectedSeats);
    void this.router.navigate(['checkout'], {relativeTo: this.route});
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
