import {
  Component,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResourceFilterService } from "src/app/shared/_services/resource-filter.service";
import { SessionStorageService } from "src/app/shared/_services/sessionStorage.service";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: "app-additional-information",
  templateUrl: "./additional-information.component.html",
  styleUrls: ["./additional-information.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AdditionalInformationComponent implements OnInit, OnDestroy {
  @Input() selectedItem: string;
  @Input() specific: string;
  @Input() address: string;
  @Input() header: string;
  @Input() showDetail: boolean;
  @Input() restaurantName: string;
  @Input() orderDismissTime: number;
  @Input() avgTime: number;
  @Input() currentTimetable;
  @Input() metapolicyExtraInfo;
  @Input() checkIn: string;
  @Input() checkOut: string;
  @Input() rating: string;
  @Input() avgPrice: number;
  @Input() reservationPolicy: any;
  @Input() currency: any;

  @Output() buttonClick = new EventEmitter<any>();

  showDiscount = false;

  selectedDate = "";
  selectedHour = "";

  adults = 0;
  children = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private sessionStoreManager: SessionStorageService,
    private resourceFilterService: ResourceFilterService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
        'custom-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/restaurant-icon.svg')
    );
  }

  getCurrencySymbol(currencyCode: string): string {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'RON':
        return 'RON'; // Or 'lei' if you prefer
      default:
        return 'RON';
    }
  }

  public ngOnInit(): void {
    const regexForReservationPolicy: RegExp = /\d+/g;
    const filters = JSON.parse(this.sessionStoreManager.get("filters"));
    if (this.reservationPolicy) {
      if (this.reservationPolicy?.match(regexForReservationPolicy)) {
        console.log('this.reservationPolicy?.match(regexForReservationPolicy)?.[0]', this.reservationPolicy?.match(regexForReservationPolicy)?.[0], this.reservationPolicy);
        this.reservationPolicy = this.reservationPolicy?.match(regexForReservationPolicy)?.[0];
      }
    }

    this.resourceFilterService.adultCount$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((adults) => {
      this.adults = adults;
    });

    this.resourceFilterService.childrenCount$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((children) => {
      this.children = children;
    });

    if (filters) {
      this.selectedDate = filters?.timePickerSearch?.timePickerDate;
      this.selectedHour = filters?.timePickerSearch?.timePickerHour;
    }
  }

  buttonClicked() {
    this.buttonClick.emit("Rezervari");
  }

  calculateDismissTimeBar(): number {
    const maxTime = 80; // Maximum time

    let value = (this.orderDismissTime * 100) / maxTime; // Calculate the value

    value = Math.max(0, Math.min(value, 100)); // Ensure the value is between 0 and 100

    return value;
  }

  calculateAvgTimeBar(): number {
    const maxTime = 120;

    let value = (this.avgTime / maxTime) * 100;

    value = Math.max(0, Math.min(value, 100));

    return value;
  }

  protected calculateElapsedTime(
    checkTime: string,
    isCheckIn: boolean,
  ): number {
    const parts: number[] = checkTime.split(":").map(Number);
    const checkMinutes: number = parts[0] * 60 + parts[1];

    if (isCheckIn) {
      const elapsedMinutes: number = checkMinutes;
      return (elapsedMinutes / (24 * 60)) * 100;
    } else {
      const elapsedMinutes: number = 24 * 60 - checkMinutes;
      return (elapsedMinutes / (24 * 60)) * 100;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
