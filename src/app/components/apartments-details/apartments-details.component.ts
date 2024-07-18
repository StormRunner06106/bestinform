import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

import {
  HotelPageModel,
  IconSource,
  RoomAmenityDetails,
  RoomGroupsModelExtended,
} from "../../shared/_models/hotelsModels.model";
import {LocalStorageService} from "../../shared/_services/localStorage.service";
import _ from "lodash";
import moment from "moment";
import {ToastService} from "../../shared/_services/toast.service";
import { data } from "../resource-presentation/mockHotels";

interface DropdownChangeEvent {
  originalEvent: Event;
  value: any;
}
enum CancellationType {
  WITHOUT = "WITHOUT",
  WITH = "WITH"
}

enum FilterTypes {
  BEDDING_TYPE = "BEDDING_TYPE",
  MEALS = "MEALS",
  FREE_CANCELLATION = "FREE_CANCELLATION",
  PAYED_CANCELLATION = "PAYED_CANCELLATION",
  PAYMENT = "PAYMENT"
}

@Component({
  selector: "app-apartments-details",
  templateUrl: "apartments-details.component.html",
  styleUrls: ["apartments-details.component.scss"]
})
export class ApartmentsDetailsComponent implements OnInit {
  @Input() selectedSearchParams: any;
  @Input() hotelDetails: HotelPageModel[];
  @Output() reservation: EventEmitter<any> = new EventEmitter<any>();

  protected loading: boolean = true;
  public roomGroups: RoomGroupsModelExtended[] = [];
  public rateHawkDict: Map<string, any>;
  public mealsHawkDict: Map<string, any>;
  public beddingsHawkDict: Map<string, any>;
  public responsiveOptions: any;
  public daysRequested = 0;
  public guests = 0;
  public children = 0;
  public mealsList = [];
  public cancellationList = [
    {
      name: CancellationType.WITHOUT,
      description: "Fara anulare gratuita"
    },
    {
      name: CancellationType.WITH,
      description: "Cu anulare gratuita"
    }
  ];
  public paymentOptions = [
    {
      name: "credit_card",
      description: "Card de credit"
    }
  ]
  public beddingOptions = [];
  public display = false;
  public shownImages = [];
  public totalImages: number = 0;
  public currentImageIndex: number = 0;
  public iconSource = IconSource;
  public rooms: any;
  public filters = {};
  public filterTypes = FilterTypes;
  public cancellationTypes = CancellationType;
  public mealOption: any;
  public beddingOption: any;

  constructor(private localStorageService: LocalStorageService,
              private toastService: ToastService) {
  }

  public ngOnInit(): void {

    //A. Tache
    Object.keys(FilterTypes).forEach(key => this.filters[key] = false);
    // this.hotelDetails = data;
    this.initRooms();

    this.rateHawkDict = new Map(this.hotelDetails[0].rateHawkDictionary.room_amenities.map(ra => [ra.name, ra.locale]));
    this.mealsHawkDict = new Map(this.hotelDetails[0].rateHawkDictionary.meals.map(ra => [ra.name, ra.locale]));
    this.beddingsHawkDict = new Map(this.hotelDetails[0].rateHawkDictionary.beddings.map(ra => [ra.name, ra.locale]));

    this.hotelDetails[0].rates.forEach(ra => {
      const newMeal = {
        name: ra.meal,
        description: this.mealsHawkDict.get(ra.meal).ro
      }
      if (this.mealsList.map(m => m.name).indexOf(ra.meal) === -1) {
        this.mealsList.push(newMeal);
      }
    });
    this.roomGroups.forEach(rg => {
      rg.rates.forEach(ra => {
        if (ra.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before) {
          const date = ra.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before;
          if (date.length === 5) {
            ra.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before_parsed =
                ra.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before_parsed =
                moment(new Date(date[0], date[1], date[2], date[3], date[4])).format("DD-MM-YYYY");
          } else {
            ra.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before_parsed = moment(new Date()).format("DD-MM-YYYY");
          }
        }
        ra.payment_options.payment_types[0].cancellation_penalties.policies.forEach(policy => {
          const start = policy.start_at;
          const end = policy.end_at;
          if (start) {
            if (start.length === 5) {
              policy.start_at_parsed = moment(new Date(start[0], start[1], start[2], start[3], start[4])).format("DD-MM-YYYY");
            } else {
              policy.start_at_parsed = moment(new Date()).format("DD-MM-YYYY");
            }
          }
          if (end) {
            if (end.length === 5) {
              policy.end_at_parsed = moment(new Date(end[0], end[1], end[2], end[3], end[4])).format("DD-MM-YYYY");
            } else {
              policy.end_at_parsed = moment(new Date()).format("DD-MM-YYYY");
            }
          }
        });
        if (ra.payment_options.payment_types[0].tax_data.taxes.length) {
          ra.payment_options.payment_types[0].tax_data.taxes.forEach(t => {
            if (t.name === "city_tax" && !t.included_by_supplier) {
              ra.payment_options.payment_types[0].tax_data.cityTax = t.amount + " " + t.currency_code;
            }
          })
        }
      });
      if(rg.name_struct && rg.name_struct.bedding_type) {
        const beddings = rg.name_struct.bedding_type.split(" ");
        beddings.forEach(b => {
          if (this.beddingsHawkDict.get(b)) {
            const newBedding = {
              name: b,
              description: this.beddingsHawkDict.get(b).ro
            }
            rg.name_struct.beddingTypeDescription = this.beddingsHawkDict.get(b).ro;
            if (this.beddingOptions.map(b => b.name).indexOf(newBedding.name)) {
              this.beddingOptions.push(newBedding);
            }
          }
        });
      }

    });

    this.initPictures();
    this.initRoomAmenities();
    this.getNightsAndGuests();

    this.responsiveOptions = [
      {
        breakpoint: "700px",
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: "1100px",
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: "2000px",
        numVisible: 3,
        numScroll: 2,
      }
    ];

    this.loading = false;
  }

  private getNightsAndGuests(): void {
    this.guests = this.selectedSearchParams.data.guests.reduce((sum, current) => sum + current.adults, 0);
    this.children = this.selectedSearchParams.data.guests.reduce((sum, current) => sum + current.children.length, 0);
    this.rooms = this.selectedSearchParams.data.guests.length;
    this.daysRequested = this.hotelDetails[0].rates[0].daily_prices.length;

  }

  private initPictures() {
    this.roomGroups.forEach(room => {
      for(let i = 0; i < room.images.length; i++) {
        room.images[i] = room.images[i].replace("{size}", "1024x768");
      }
    });
  }

  private initRoomAmenities() {
    this.roomGroups.forEach(room => {
      room.roomAmenitiesDetails = [];
      // room.room_amenities = room.room_amenities.concat(room.room_amenities).concat(room.room_amenities);
      room.room_amenities.forEach(ra => {
        const roomAmenityDetails = new RoomAmenityDetails();
        roomAmenityDetails.description = this.rateHawkDict.get(ra).ro;
        roomAmenityDetails.icon = "pi pi-check";
        switch (ra) {
          case "private-bathroom":
            roomAmenityDetails.icon = "bathtub";
            roomAmenityDetails.iconSource = IconSource.MATERIAL;
            break;
          case "fridge":
            roomAmenityDetails.icon = "kitchen";
            roomAmenityDetails.iconSource = IconSource.MATERIAL;
            break;
          case "tea-or-coffee":
          case "coffee":
            roomAmenityDetails.icon = "assets/icons/brandbook/coffe_maker.svg";
            roomAmenityDetails.iconSource = IconSource.OWN;
            break;
          case "towels":
            roomAmenityDetails.icon = "assets/icons/brandbook/towels.svg";
            roomAmenityDetails.iconSource = IconSource.OWN;
            break;
          case "wi-fi":
            roomAmenityDetails.icon = "wifi";
            roomAmenityDetails.iconSource = IconSource.MATERIAL;
            break;
          case "wardrobe":
            roomAmenityDetails.icon = "assets/icons/brandbook/robe.svg";
            roomAmenityDetails.iconSource = IconSource.OWN;
            break;
          case "kitchen":
            roomAmenityDetails.icon = "assets/icons/brandbook/fork_and_knife.svg"
        }
        room.roomAmenitiesDetails.push(roomAmenityDetails);
      });
    })
  }

  mealChanged($event: DropdownChangeEvent) {
    if (!$event.value) {
      this.roomGroups = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[]).filter(rg => rg.rates && rg.rates.length);
    } else {
      this.roomGroups = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[])
          .filter(rg =>
              rg.rates && rg.rates.length && rg.rates.map(ra => ra.meal).includes($event.value.name)
          );
    }

  }

  cancellationChanged($event: DropdownChangeEvent) {
    if (!$event.value) {
      this.roomGroups = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[]).filter(rg => rg.rates && rg.rates.length);
    } else if ($event.value.name === CancellationType.WITH) {
      this.roomGroups = [];

      const roomGroupAux = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[])
          .filter(rg =>
              rg.rates && rg.rates.length);
      roomGroupAux.forEach(roomGroup => {
        const rates = [];
        roomGroup.rates.forEach(rate => {
          if (rate.payment_options.payment_types[0].cancellation_penalties.policies && rate.payment_options.payment_types[0].cancellation_penalties.policies.length) {
            rates.push(rate);
          }
        });
        if (rates.length) {
          const clone = _.cloneDeep(roomGroup);
          roomGroup.rates = rates;
          this.roomGroups.push(clone);
        }
      });
    } else {
      this.roomGroups = [];

      const roomGroupAux = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[])
          .filter(rg =>
              rg.rates && rg.rates.length);
      roomGroupAux.forEach(roomGroup => {
        const rates = [];
        roomGroup.rates.forEach(rate => {
          if (rate.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before) {
            rates.push(rate);
          }
        });
        if (rates.length) {
          const clone = _.cloneDeep(roomGroup);
          roomGroup.rates = rates;
          this.roomGroups.push(clone);
        }
      });
    }
  }

  filtersChanged($event: DropdownChangeEvent, type: FilterTypes) {
    //TODO A.Tache implement

    if (!$event.value) {
      if (type) {
        this.filters[type] = false;
      } else {
        this.filters[FilterTypes.FREE_CANCELLATION] = false;
        this.filters[FilterTypes.PAYED_CANCELLATION] = false;
      }
      const filtersExist = Object.values(this.filters).filter(f => f).length > 0;
      if (!filtersExist) {
        this.initRooms();
        return;
      }
    } else {
      if (type === FilterTypes.MEALS) {
        this.mealOption = $event.value.name;
      }
      if (type === FilterTypes.BEDDING_TYPE) {
        this.beddingOption = $event.value.name;
      }
      if (type === FilterTypes.FREE_CANCELLATION) {
        this.filters[FilterTypes.PAYED_CANCELLATION] = false;
      }
      if (type === FilterTypes.PAYED_CANCELLATION) {
        this.filters[FilterTypes.FREE_CANCELLATION] = false;
      }
      this.filters[type] = true;
    }

    this.roomGroups = [];

    const roomGroupAux = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[])
        .filter(rg =>
            rg.rates && rg.rates.length);

    roomGroupAux.forEach(roomGroup => {
      const rates = [];
      roomGroup.rates.forEach(rate => {
        let add = true;
        if (this.filters[FilterTypes.PAYED_CANCELLATION]) {
          if (!(rate.payment_options.payment_types[0].cancellation_penalties.policies
              && rate.payment_options.payment_types[0].cancellation_penalties.policies.length
              && !rate.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before)) {
            add = false;
          }
        }
        if (this.filters[FilterTypes.FREE_CANCELLATION]) {
          if (!rate.payment_options.payment_types[0].cancellation_penalties.free_cancellation_before) {
            add = false;
          }
        }
        if (this.filters[FilterTypes.MEALS]) {
          if(rate.meal !== this.mealOption) {
            add = false;
          }
        }
        if (this.filters[FilterTypes.BEDDING_TYPE]) {
          if (!(roomGroup.name_struct && roomGroup.name_struct.bedding_type && roomGroup.name_struct.bedding_type.includes(this.beddingOption))) {
            add = false;
          }
        }
        if (add) {
          rates.push(_.cloneDeep(rate));
        }
      });
      if (rates.length) {
        const clone = _.cloneDeep(roomGroup);
        clone.rates = rates;
        this.roomGroups.push(clone);
      }
    });

    this.initRooms(true);

  }

  beddingOptionsChanged($event: DropdownChangeEvent) {
    if (!$event.value) {
      this.roomGroups = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[]).filter(rg => rg.rates && rg.rates.length);
    } else {
      this.roomGroups = [];
      const roomGroupAux = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[])
          .filter(rg =>
              rg.rates && rg.rates.length);
      roomGroupAux.forEach(roomGroup => {

        if (roomGroup.name_struct && roomGroup.name_struct.bedding_type && roomGroup.name_struct.bedding_type.includes($event.value.name)) {
          const clone = _.cloneDeep(roomGroup);
          this.roomGroups.push(clone);
        }
      });
    }
  }

  public galleriaClass(room: RoomGroupsModelExtended): string {
    if (room.images?.length) {
      if (room.images?.length > 99) {
        this.totalImages = 99;
      } else {
        this.totalImages = room.images?.length;
      }
    }
    return `custom-galleria ${this.display ? "fullscreen" : ""}`;
  }

  public updateCurrentImageIndex(index: number) {
    this.currentImageIndex = index;
  }

  handleImageError(event: any, url: string) {
    // try again with the url
    event.target.src = url;
  }

  showReservation($event: any) {
    this.reservation.emit({
      room: $event.room,
      rooms: this.rooms,
      rate: $event.rate,
      guests: this.guests,
      children: this.children,
      daysRequested: this.daysRequested,
      selectedSearchParams: this.selectedSearchParams,
      hotelName: this.hotelDetails[0].hotel.name,
      hotelAddress: this.hotelDetails[0].hotel.address,
      latitude: this.hotelDetails[0].hotel.latitude,
      longitude: this.hotelDetails[0].hotel.longitude,
    });
  }

  private initRooms(skipInitAll = false) {
    if (!skipInitAll) this.roomGroups = (this.hotelDetails[0].hotel.room_groups as RoomGroupsModelExtended[]).filter(rg => rg.rates && rg.rates.length);
    this.roomGroups.sort((a, b) => {
          if (a.rates && a.rates.length && a.rates[0].daily_prices && a.rates[0].daily_prices[0]) {
            if (b.rates && b.rates.length && b.rates[0].daily_prices && b.rates[0].daily_prices[0]) {
              return a.rates[0].daily_prices[0] < b.rates[0].daily_prices[0] ? -1 : 1;
            }
            return 1;
          }
          return 1;
        }
    );
  }

  openGalleria(room: RoomGroupsModelExtended) {
    this.display = !this.display;
    this.shownImages = [...room.images];
  }
}
