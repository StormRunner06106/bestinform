import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import {ResourceFilterService} from "../../shared/_services/resource-filter.service";
import {MatCard} from "@angular/material/card";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Subscription } from "rxjs";

@Component({
  selector: "app-card-slider",
  templateUrl: "./card-slider.component.html",
  styleUrls: ["./card-slider.component.scss"],
})
export class CardSliderComponent implements OnInit, OnDestroy {
  constructor(
      private router: Router,
      private resourceFilterService: ResourceFilterService,
      private readonly breakPointObserver: BreakpointObserver
  ) {}

  @ViewChild("slider", { static: false }) slider: ElementRef;
  @Output() onBtnClick = new EventEmitter();

  @Input() sliderCards = [];
  @Input() disableCarouselAnimation: boolean = false;
  @Input() title: string;
  @Input() isTitle = false;
  @Input() hasButton = false;
  @Input() hasBottomButton = false;
  @Input() size: string;
  @Input() events = false;
  @Output() selected = new EventEmitter<any>();
  @Output() buttonEmitter = new EventEmitter<any>();
  @Input() inputType;
  @Input() listingPage = false;
  @Input() disableHover = false;
  @Input() hotelsRestaurants: boolean = false;
  @Input() extra: any;
  @Input() listingCards: boolean;
  selectedCard: any;
  responsiveOptions: any[];
  visibilityOptions;
  orientation: string;

  public hotelsCards = [];
  isMobile: boolean;

  private readonly subscriptions = new Subscription();

  ngOnInit() {

    this.subscriptions.add(
      this.breakPointObserver.observe(['(max-width: 980px)']).subscribe((result)=> this.isMobile = result.breakpoints['(max-width: 980px)'])
    )
    

    if (this.inputType === 'hotels' && this.listingCards) {
      this.listingCards = true;
      this.sliderCards = undefined;
    }
    if (this.extra && this.extra.room && this.extra.room.rates) {
      this.extra.room.rates.forEach(r => {
        const cancellationPenalties = r.payment_options.payment_types[0].cancellation_penalties;
        const hasPolicies = cancellationPenalties.policies.filter(p => p.start_at !== null || p.end_at !== null).length > 0;
        if (!cancellationPenalties.free_cancellation_before && !hasPolicies) {
          r.payment_options.payment_types[0].cancellation_penalties.noCancellation = true;
        }
      });
    }

    if (this.size === "small") {
      this.orientation = "horizontal";
      this.responsiveOptions = [
        {
          breakpoint: '550px',
          numVisible: 2.5,
          numScroll: 1,
        },
        {
          breakpoint: '700px',
          numVisible: 2.5,
          numScroll: 1,
        },
        {
          breakpoint: '1000px',
          numVisible: 4,
          numScroll: 2,
        },
        {
          breakpoint: '1300px',
          numVisible: 5,
          numScroll: 2,
        },
      ];
      this.visibilityOptions = {
        numVisible: 6,
        numScroll: 2,
      };
    } else if (this.size === "big") {
      this.orientation = "horizontal";
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
        },
      ];
      this.visibilityOptions = {
        numVisible: 3,
        numScroll: 3,
      };
    } else {
      this.checkScreenSize();
      window.addEventListener("resize", this.checkScreenSize.bind(this));
      if (window.matchMedia("(max-width: 980px)").matches) {
        this.orientation = "horizontal";
      } else {
        this.orientation = "vertical";
      }
      this.visibilityOptions = {
        numVisible: 4,
        numScroll: 2,
      };
    }
    this.hotelsCards = [
      {
        cardText: {
          title: "Prezentare",
        },
        selected: true
      },
      {
        cardText: {
          title: "Camere",
        },
        selected: false
      },
      {
        cardText: {
          title: "Facilitati",
        },
        selected: false
      }
    ];
    if (this.inputType === 'hotels' && this.extra && this.extra.room) {
      this.visibilityOptions = {
          numVisible: 2.5,
          numScroll: 2,
        };
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    
    // window?.removeEventListener("resize", this.checkScreenSize.bind(this));
  }

  selectCard(card: any) {
    console.log(card, "card");
    this.resourceFilterService.selectedSearchStateSubject.next(card.cardText.title);
    this.selectedCard = card;
    this.selected.emit(card);
      if (card.type === 'editorial'){
          this.redirectById(card.slug)
      }
  }

  isSelected(card: any): boolean {
    return this.selectedCard && this.selectedCard === card && !this.extra;
  }

  get isEventsTrue(): boolean {
    return this.events === true;
  }

  checkScreenSize(): void {
    // TODO: Bogdan i did here a flag for check if it comes from hotelDetails u can remove it if no neede
    if (this.hotelsRestaurants) {
      this.orientation = "horizontal";
    } else {
      if (window.matchMedia("(max-width: 980px)").matches) {
        this.orientation = "horizontal";
        this.responsiveOptions = [
          {
            breakpoint: "550px",
            numVisible: 1,
            numScroll: 1,
          },
          {
            breakpoint: "700px",
            numVisible: 2,
            numScroll: 2,
          },
          {
            breakpoint: "1000px",
            numVisible: 3,
            numScroll: 2,
          },
          {
            breakpoint: "1200px",
            numVisible: 4,
            numScroll: 2,
          },
        ];
      } else {
        this.orientation = "vertical";
      }
    }
  }

  showReservation(room: any, rate: any) {
    this.buttonEmitter.emit({
      room: room,
      rate: rate
    });
  }

  public redirectByType(): void {
    this.onBtnClick.emit('editorials')
  }

  selectedHotelCard(index: number) {
    this.hotelsCards.forEach(hc => {
      hc.selected = false;
    });
    this.hotelsCards[index].selected = true;
    this.selectCard(this.hotelsCards[index]);
  }

  selectedRestaurantCard(index: number) {
    this.sliderCards.forEach(hc => {
      hc.selected = false;
    });
    this.sliderCards[index].selected = true;
    this.selectCard(this.sliderCards[index]);
  }

  public redirectById(content): void {
    this.router.navigate([`/client/dashboard/editorials/${content}`])
  }
}
