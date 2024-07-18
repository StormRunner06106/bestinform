import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators,} from "@angular/forms";
import {PlatformLocation} from "@angular/common";
import {CountryISO, PhoneNumberFormat, SearchCountryField,} from "ngx-intl-tel-input";
import {AuthService} from "../../shared/_services/auth.service";
import {User} from "../../shared/_models/user.model";
import {mapsOptions, triangleIcon} from "../../shared/maps-options";
import {MatDialog} from "@angular/material/dialog";
import moment from "moment";
import {SelectedItemForDetailsService} from "../../shared/_services/selected-item-for-details.service";
import {
  CancelationPenaltiesModel,
  HotelModel,
  PaymentTypesModel,
  RoomDetails
} from "../../shared/_models/hotelsModels.model";
import {HotelsService} from "../../shared/_services/hotels.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {MessageService} from "primeng/api";
import {PrebookConfirmationComponent} from "./dialog/prebook-confirmation.component";

interface RadioButtonClickEvent {
  originalEvent: Event;
  value: any;
}
@Component({
  selector: "app-hotel-reservation-form",
  templateUrl: "hotel-reservation-form.component.html",
  styleUrls: ["hotel-reservation-form.component.scss"],
  providers: [DialogService, MessageService]
})
export class HotelReservationFormComponent implements OnInit {
  protected privateInfoForm: FormGroup;
  protected factureInfoForm: FormGroup;
  protected specialInfoForm: FormGroup;

  @Input()
  public roomDetails: RoomDetails;

  @Output()
  public backButtonEmitter: EventEmitter<any> = new EventEmitter<any>();

  protected countries: { name: string; code: string }[] = [];

  public user: User;
  public age = [];
  public loading = true;
  public showEarlyCI = false;
  public showLateCO = false;
  public workTravel = true;
  public perks: any;
  public googlemapOptions = mapsOptions;
  public center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  public zoom = 12;
  display: any;
  markerPositions: any[] = [];
  public markerOptions: any = {
    draggable: false,
    icon: {
      url: '../../../../assets/images/others/frame.svg',
      scaledSize: new google.maps.Size(45, 45 ) // Adjust the size here
    }
  };

  public inactiveMarker : any = {
    draggable: false,
    icon: triangleIcon,
  };
  public markerData: any;
  public isMarkerClicked = false;
  public showEarlyCIResult: boolean = false;
  public showLateCOResult: boolean = false;
  public finalPrice = 0;
  public checkInParsed: any;
  public checkOutParsed: any;
  public hotel: HotelModel;
  public paymentType: PaymentTypesModel;
  public cancelationPenalties: CancelationPenaltiesModel;
  public ref: DynamicDialogRef | undefined;

  constructor(private _formBuilder: FormBuilder,
              public modal: MatDialog,
              private platformLocation: PlatformLocation,
              private selectedItemForDetailsService: SelectedItemForDetailsService,
              private hotelsService: HotelsService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private authService: AuthService) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      this.backButtonEmitter.emit();
    });
  }

  public ngOnInit(): void {
    this.hotel = this.selectedItemForDetailsService.getSavedHotel();

    this.center = {
      lat: this.hotel.latitude,
      lng: this.hotel.longitude,
    };
    this.paymentType = this.roomDetails.rate.payment_options.payment_types[0];
    this.cancelationPenalties = this.paymentType.cancellation_penalties;
    this.finalPrice = this.roomDetails.rate.payment_options.payment_types[0].amount;

    this.perks = this.roomDetails.rate.payment_options.payment_types[0].perks;

    if (this.perks.early_checkin) this.showEarlyCI = true;
    if (this.perks.late_checkout) this.showLateCO = true;

    moment.locale('ro');
    this.checkInParsed = moment(new Date(this.roomDetails.selectedSearchParams.data.checkin)).format('DD MMMM yyyy');
    this.checkOutParsed = moment(new Date(this.roomDetails.selectedSearchParams.data.checkout)).format('DD MMMM yyyy');


    this.privateInfoForm = this._formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      // email: ["", Validators.required, Validators.email],
      email: ["", Validators.required],
      phone: ["", Validators.required],
      country: ["", Validators.required],
    });

    for(let i = 0; i < this.roomDetails.guests; i++) {
      this.privateInfoForm.addControl("guestFirstName" + i, new FormControl("", Validators.required));
      this.privateInfoForm.addControl("guestLastName" + i, new FormControl("", Validators.required));
    }
    for(let i = 0; i < this.roomDetails.children; i++) {
      this.privateInfoForm.addControl("childFirstName" + i, new FormControl("", Validators.required));
      this.privateInfoForm.addControl("childLastName" + i, new FormControl("", Validators.required));
      this.privateInfoForm.addControl("childAge" + i, new FormControl("", Validators.required));
    }

    this.factureInfoForm = this._formBuilder.group({
      workTravel: [false, Validators.required],
      companyName: ["", Validators.required],
      cif: ["", Validators.required],
      sellNumb: ["", Validators.required],
      companyFaceName: ["", Validators.required],
      officeAddress: ["", Validators.required],
    });

    this.specialInfoForm = this._formBuilder.group({
      earlyCheckIn: [false, []],
      lateCheckOut: [false, []],
      specialRequest: ["", []],
      useLoyaltyPoints: [false, []],
      paymentMethod: [false, []],
    });

    this.countries = [
      { name: "Australia", code: "AU" },
      { name: "Brazil", code: "BR" },
      { name: "China", code: "CN" },
      { name: "Egypt", code: "EG" },
      { name: "France", code: "FR" },
      { name: "Germany", code: "DE" },
      { name: "India", code: "IN" },
      { name: "Romania", code: "RO" },
      { name: "Japan", code: "JP" },
      { name: "Spain", code: "ES" },
      { name: "United States", code: "US" },
    ];

    for(let i = 1; i <= 17; i++) {
      this.age.push({
        name: i,
        value: i
      })
    }

    for(let i = 0; i < this.roomDetails.room.images.length; i++) {
      this.roomDetails.room.images[i] = this.roomDetails.room.images[i].replace("{size}", "1024x768");
    }

    this.markerPositions.push({
      ...this.roomDetails.room,
      lat: this.roomDetails.latitude,
      lng: this.roomDetails.longitude,
      label: this.roomDetails.hotelName,
      activeIcon: true,
      options: {
        draggable: false,
        icon: {
          url: '../../../../assets/images/others/frame.svg',
          scaledSize: new google.maps.Size(45, 45) // Adjust the size here
        }
      }
    });

    this.authService.getCurrentUser().subscribe((user) => {
      this.user = user;
      this.privateInfoForm.get("firstName").setValue(this.user.firstName);
      this.privateInfoForm.get("lastName").setValue(this.user.lastName);
      this.privateInfoForm.get("email").setValue(this.user.email);
      this.privateInfoForm.get("phone").setValue(this.user.telephone);
      this.privateInfoForm.get("country").setValue({name: "Romania", code: "RO"});
      this.loading = false;
    });

  }

  protected readonly CountryISO = CountryISO;
  protected readonly PhoneNumberFormat = PhoneNumberFormat;
  protected readonly SearchCountryField = SearchCountryField;
  earlyCIValue = false;

  toggle($event: RadioButtonClickEvent) {
    this.factureInfoForm.get("workTravel").setValue($event.value);
  }

  togglePayment($event: RadioButtonClickEvent) {
    this.specialInfoForm.get("paymentMethod").setValue($event.value);
  }


  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  openModal(mapsModalTemplate: TemplateRef<any>) {
    this.modal.open(mapsModalTemplate);
  }
  closeModal(): void {
    this.modal.closeAll();
  }
  public getLocationDetails(data: any, event: any): void {
    this.center = {
      lat: data.lat,
      lng: data.lng
    };
    this.markerData = data;
    this.isMarkerClicked = true;

  }

  toggleEarly($event: any) {
    if ($event.checked) {
      this.showEarlyCIResult = true;
      this.finalPrice += Number(this.perks.early_checkin[0].show_price.split(this.roomDetails.rate.payment_options.payment_types[0].show_currency_code)[0]);
    } else {
      this.showEarlyCIResult = false;
      this.finalPrice -= Number(this.perks.early_checkin[0].show_price.split(this.roomDetails.rate.payment_options.payment_types[0].show_currency_code)[0]);
    }
  }

  toggleLate($event: any) {
    if ($event.checked) {
      this.showLateCOResult = true;
      this.finalPrice += Number(this.perks.late_checkout[0].show_price.split(this.roomDetails.rate.payment_options.payment_types[0].show_currency_code)[0]);
    } else {
      this.showLateCOResult = false;
      this.finalPrice -= Number(this.perks.late_checkout[0].show_price.split(this.roomDetails.rate.payment_options.payment_types[0].show_currency_code)[0]);
    }
  }

  bookRoom() {
    this.ref = this.dialogService.open(PrebookConfirmationComponent, {
      header: "Price change",
      width: "50vw",
      contentStyle: { overflow: 'auto' }
    });
    this.ref.onClose.subscribe((res) => {
      if (res) {
        debugger;
      }
    })
    // this.hotelsService.prebook({hash: this.roomDetails.rate.book_hash, priceIncreasePercent: 5})
    //     .subscribe((prebookModel: PrebookModel) => {
    //       if (prebookModel.changes.changes) {
    //
    //       }
    //     })
  }
}
