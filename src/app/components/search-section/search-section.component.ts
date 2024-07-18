import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  OnInit,
  Output,
} from "@angular/core";
import { AppSettings, Settings } from "../../app.settings";
import { DomSanitizer } from "@angular/platform-browser";
// import {LoginComponent} from "../../../auth/login/login.component";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { ResourceFilterService } from "src/app/shared/_services/resource-filter.service";
import { BehaviorSubject, Observable } from "rxjs";
import { SelectedItemForDetailsService } from "../../shared/_services/selected-item-for-details.service";
import { HotelModel } from "../../shared/_models/hotelsModels.model";
import {MainSearchComponent} from "../main-search/main-search.component";

@Component({
  selector: "app-search-section",
  templateUrl: "./search-section.component.html",
  styleUrls: ["./search-section.component.scss"],
})
export class SearchSectionComponent implements OnInit, OnDestroy {
  @Input() backgroundImage;
  @Input() title;
  @Input() buttonText;
  @Input() restaurantInfo: string;
  @Input() desc;
  @Input() fullscreen = false;
  @Input() isBiggerThan981 = false;
  @Input() redirectUrl: string;
  @Input() userConnected: boolean;
  @Input() listingSearch = false;
  @Input() selected = "hotels";
  @Input() imageCardSize = "small";
  @Input() listingCards;
  @Input() disableHover = false;
  @Input() rating = false;
  @Input() imagesTemplate: TemplateRef<any>;
  @Output() getPlaneOffers = new EventEmitter<any>();
  @Output() selectedChange = new EventEmitter<any>();
  listingPage = true;
  sliderCards = [];

  public disableCarouselAnimationSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public disableCarouselAnimation$: Observable<any> =
    this.disableCarouselAnimationSubject.asObservable();

  public bgImage;
  public settings: Settings;

  restaurantName = "";
  protected itemName: string = "";
  protected increaseImage: boolean = false;
  protected itemRating: number = 0;
  protected starRating: number = 0;
  public showDefaultImg: boolean = true;

  constructor(
    public appSettings: AppSettings,
    private sanitizer: DomSanitizer,
    public modalService: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private resourceFilterService: ResourceFilterService,
    private selectedItemForDetailsService: SelectedItemForDetailsService,
  ) {
    this.settings = this.appSettings.settings;
    setTimeout((): void => {
      this.settings.headerBgImage = true;
    });
  }

  public ngOnInit(): void {
    this.selectedItemForDetailsService.clearTitle$.subscribe((next) => this.title = undefined);
    this.route.paramMap.subscribe((params) => {

      if(this.router.url.includes('/view')){
        this.showDefaultImg = false;
      }
      const categoryId = params.get("categoryId");
      const resourceTypeId = params.get("resourceTypeId");

      if (
        categoryId === "63dbb183df393f737216183c" &&
        resourceTypeId === "63dbb18cdf393f737216183d"
      ) {
        this.selected = "restaurants";
        this.disableCarouselAnimationSubject.next(true);
      } else if (
        categoryId === "63d2ae569d6ce304608d1a88" &&
        resourceTypeId === "63d8d4a9d2180d7935acb4e0"
      ) {
        this.selected = "hotels";
        this.disableCarouselAnimationSubject.next(true);
      }
    });
    this.sliderCards = this.getSliderCards();

      if (this.selected === 'hotels') {
          this.selectedItemForDetailsService
              .getUpdatedSelectedItem()
              .subscribe((value: HotelModel | any): void => {
                //TODO A.Tache rollback
                if (value?.name) {
                      this.itemName = value.name;
                      this.itemRating = value.rating;
                      this.starRating = value.star_rating;
                      this.title = value.name;

                      const images = value.hotelImages || value.images;

                      this.increaseImage = true;
                      if (images[0].includes("240x240")) {
                        this.backgroundImage = `url(${images[0].replace(
                            "240x240",
                            "1024x768",
                        )})`;
                      } else if (images[0].includes("{size}")){
                        this.backgroundImage = `url(${images[0].replace(
                            "{size}",
                            "1024x768",
                        )})`;
                      } else {
                        this.backgroundImage = `url(${images[0]})`;
                      }
                  } else {
                      this.itemName = null;
                      this.itemRating = null;
                      this.starRating = null;

                      this.increaseImage = false;

                  }
              });
      }

  }

  protected getSliderCards() {
    return [
      {
        imageUrl: "../../../../assets/images/others/image-card/last/hotels.png",
        cardText: {
          title: "Hoteluri",
        },
        inputType: "hotels",
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/last/avia.png",
        cardText: {
          title: "Bilete avion",
        },
        inputType: "planes",
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/last/restaurants.png",
        cardText: {
          title: "Restaurante",
        },
        inputType: "restaurants",
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/last/events.png",
        cardText: {
          title: "Spectacole",
        },
        inputType: "events",
        disabled: true,
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/last/places.png",
        cardText: {
          title: "Atractii",
        },
        inputType: "common",
        disabled: true,
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/last/journey.png",
        cardText: {
          title: "Experiente",
        },
        inputType: "common",
        disabled: true,
      },
      // {
      //   imageUrl: "../../../../assets/images/others/image-card/last/journey.png",
      //   cardText: {
      //     title: "Experiente",
      //   },
      //   inputType: "common",
      // },
      // {
      //   imageUrl: "../../../../assets/images/others/image-card/experiences.png",
      //   cardText: {
      //     title: "Experiente",
      //   },
      //   inputType: "common",
      // },
      // {
      //   imageUrl: "../../../../assets/images/others/image-card/experiences.png",
      //   cardText: {
      //     title: "Experiente",
      //   },
      //   inputType: "common",
      // },
    ];
  }

  setSelected(event: any, mainSearchComponent: MainSearchComponent) {
    this.selected = event.inputType;
  }

  setSelectedCard(event: any) {
    console.log('selected', event);
    this.selectedChange.emit(event);
  }

  updatePlaneOffers(event) {
    this.getPlaneOffers.emit("Update plane offers");
  }

  public ngOnDestroy(): void {
    setTimeout((): void => {
      this.settings.headerBgImage = false;
      this.settings.contentOffsetToTop = false;
      this.itemName = null;
      this.itemRating = null;
      this.starRating = null;

      this.increaseImage = false;
      this.backgroundImage =
        "url(../../../../assets/images/others/hero-section/hero-section.png)";
    });
  }
}
