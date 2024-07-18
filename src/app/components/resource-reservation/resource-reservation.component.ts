import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";
import { takeUntil } from 'rxjs/operators';
import { AuthService } from "src/app/shared/_services/auth.service";
import { ResourceFilterService } from "src/app/shared/_services/resource-filter.service";
import { SessionStorageService } from "src/app/shared/_services/sessionStorage.service";
import { ToastService } from "src/app/shared/_services/toast.service";
import { Observable, Subject, tap } from "rxjs";
import { ICountries } from "./shared/available-countries";

@Component({
  selector: "app-resource-reservation",
  templateUrl: "./resource-reservation.component.html",
  styleUrls: ["./resource-reservation.component.scss"],
})
export class ResourceReservationComponent implements OnInit, OnDestroy {
  @Input() restId = "";
  @Input() availablePlaces = 0;
  @Input() disableForm = false;
  @Input() buttonHidden = false;
  @Input() preventNavigation = false;
  @Input() submitObservable: Observable<boolean>;
  @Output() sessionId = new EventEmitter<string>;
  reservationForm: FormGroup;
  private ngUnsubscribe$ = new Subject<void>();

  stateOptions: any[] = [
    { label: "Doar Dus", value: "go" },
    { label: "Dus-intors", value: "comeBack" },
  ];
  calendarOption: any = "single";
  minimumDate: Date = new Date();
  rangeDates: Date[] = [];
  checked = false;

  adults = 0;

  selectedPreference: any;
  preferences = [];
  specialRequest = "";

  name = "";
  surname = "";
  phone = "";
  email = "";
  country = "";
  // selectedCountry: any;
  phoneCountry: any;
  // countries: any[];
  filteredCountries: ICountries[];
  // form: FormGroup;


  // for ngx-intl-tel-input
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  currentUserId = "";
  currentUserEmail = "";
  date;
  time;

  previousAdults = 0;

  constructor(
    private sessionStoreManager: SessionStorageService,
    private authService: AuthService,
    private resourceFilterService: ResourceFilterService,
    private toastService: ToastService,
    private router: Router,
    private translateService: TranslateService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.submitObservable.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
        this.submitReservation();
      }
    );
    // this.form = this.formBuilder.group({
    //   selectedCountry: [''] // Initialize with an empty value
    // });

    if(this.disableForm) {
      console.log("@@@@ ->" + this.disableForm)
        this.toastService.showToast(
          "Reservation Error",
          "Nu sunt locuri disponibile pentru aceast restaurant. Va rugam sa incercati mai tarziu.",
          "error"
        );
    }

    this.minimumDate = new Date();

    const savedFilters = JSON.parse(this.sessionStoreManager.get("filters"));

    const adultsNumber = savedFilters.adultsNumber || 0;

    const date = savedFilters.timePickerSearch.timePickerDate || new Date();
    const time = savedFilters.timePickerSearch.timePickerHour || new Date();

    this.reservationForm = new FormGroup({
      date: new FormControl({value: date, disabled: true}, Validators.required),
      time: new FormControl({value: time, disabled: true}, Validators.required),
      adults: new FormControl({value: adultsNumber, disabled: true}, [Validators.required, Validators.min(1)]),
      selectedPreference: new FormControl({value: null, disabled: this.disableForm}, Validators.required),
      specialRequest: new FormControl({value: "", disabled: this.disableForm}),
      surname: new FormControl({value: "", disabled: this.disableForm}, Validators.required),
      name: new FormControl({value: "", disabled: this.disableForm}, Validators.required),
      email: new FormControl({value: "", disabled: this.disableForm}, [Validators.required, Validators.email]),
      phone: new FormControl({value: "", disabled: this.disableForm}, Validators.required), // Adjust based on ngx-intl-tel-input
      // selectedCountry: new FormControl({value: null, disabled: this.disableForm}),
      loyaltyPoints: new FormControl({value: false, disabled: this.disableForm})
    });

    this.reservationForm.updateValueAndValidity( { emitEvent: false } );

    this.authService.getCurrentUser()
        .pipe(
            tap(item => {
              const { surname, name, email, phone } = this.reservationForm.controls;
              surname.setValue(item.lastName);
              name.setValue(item.firstName);
              phone.setValue(item.telephone);
              email.setValue(item.email);
            })
        )
        .subscribe();

    console.log("savedFilters", savedFilters);
    this.adults = savedFilters.adultsNumber;

    this.previousAdults = this.adults;

    this.resourceFilterService.setAdultCount(this.adults);

    this.preferences = [
      { name: "Terasa", code: "TERRACE" },
      { name: "Terasa Acoperita", code: "COVERED_TERRACE" },
      { name: "Interior", code: "INSIDE" },
      { name: "Oriunde", code: "ANYWHERE" },
    ];

    // this.countries = availableCountriesList.sort((a, b) => {
    //   if (a.order !== undefined && b.order !== undefined) {
    //     return a.order - b.order;
    //   } else if (a.order !== undefined) {
    //     return -1; // a has order, so it should come before b
    //   } else if (b.order !== undefined) {
    //     return 1; // b has order, so it should come before a
    //   } else {
    //     return 0; // neither a nor b has order, maintain the original order
    //   }
    // });
  }

  // filterCountries(query: string) {
  //   this.filteredCountries = this.countries.filter(country => {
  //     return country.name.toLowerCase().includes(query.toLowerCase())
  //   });
  //
  //
  //   this.form.get('selectedCountry').valueChanges.subscribe((selectedCountryName: string) => {
  //     this.reservationForm.patchValue({selectedCountry: selectedCountryName['code'] });
  //   });
  // }

  modifyCalendar() {
    this.calendarOption = this.calendarOption === "single" ? "range" : "single";
    this.rangeDates = [];
  }

  private getDateAndTime(dateString1, dateString2): string {
    // Parse the strings into Date objects
    const dateValue: Date = new Date(dateString1);
    const timeValue: Date = new Date(dateString2);

    // Extract components
    const year: number = dateValue.getFullYear();
    const month: number = dateValue.getMonth(); // Note: months are 0-indexed
    const day: number = dateValue.getDate();

    // Split time string only if it's defined
    const timeSplit: string[] = dateString2.split(':');
    const hours: number = timeSplit.length > 0 ? Number(timeSplit[0]) : 0;
    const minutes: number = timeSplit.length > 1 ? Number(timeSplit[1]) : 0;

    // Optionally, handle null values for timeValue
    if (isNaN(timeValue.getTime())) {
      console.error('Invalid time string:', dateString2);
      // handle the error accordingly
    }

    // Construct a new Date object with local time zone offset
    const combinedDate: Date = new Date(Date.UTC(year, month, day, hours, minutes));

    // Convert to ISO format
    return combinedDate.toISOString();
  }

  onAdultsChange(newAdultsCount: number) {
    if (this.previousAdults > newAdultsCount) {
      this.resourceFilterService.decreaseAdultCount();
    } else if (this.previousAdults < newAdultsCount) {
      this.resourceFilterService.increaseAdultCount();
    }
    this.previousAdults = newAdultsCount; // Update the previousAdults to the new value
    this.adults = newAdultsCount; // Update the adults count
  }

  submitReservation() {
    console.log(this.reservationForm)
    if (this.reservationForm.valid) {

      const { time, date, adults } = this.reservationForm.controls;

      const formValues = this.reservationForm.value;

      console.log(formValues)
      const body = {
        restaurantId: this.restId,
        clientId: this.currentUserId,
        customerEmail: formValues.email,
        customerName: formValues.name + " " + formValues.surname,
        contactNumber: formValues.phone['internationalNumber'], // Make sure you handle the phone form control correctly
        adults: adults.value,
        seatPreferences: formValues.selectedPreference?.name,
        specialRequest: formValues.specialRequest,
        whereToStay: formValues.selectedPreference.code, // Accessing selectedPreference directly from form values
        // country: formValues.selectedCountry,
        children: 0,
        dateTime: this.getDateAndTime(date.value, time.value),
        notes: formValues.specialRequest,
        loyaltyPoints: formValues.loyaltyPoints
    };
      console.log("body", body);

      this.resourceFilterService.submitRestaurantReservation(body).subscribe({
        next: (res: any) => {
            console.log("Reservation response:", res);
            // Show success toast
            this.translateService.get("ERRORS.RESERVATION-SUCCESS").subscribe((res) => {
              this.toastService.showToast("Success", res, "success");
            });

            // Redirect on successful form submission
            if (!this.preventNavigation) {
              this.router.navigate([`/client/dashboard/my-booking/view/${res.reason}`]);
            } else {
              this.sessionId.next(res?.reason);
            }
        },
        error: (error) => {
            console.error('Reservation error:', error);
            // Show error toast
            this.translateService.get("ERRORS.FORM-ERROR").subscribe((res) => {
              this.toastService.showToast("Error", res, "error");
            });
        }
    });
    } else {
      // Trigger validation messages to show
      Object.keys(this.reservationForm.controls).forEach((field) => {
        const control = this.reservationForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      this.translateService.get("ERRORS.FORM-ERRORS").subscribe((res) => {
        this.toastService.showToast(
          "Validation Error",
          res,
          "error"
        );
      });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
