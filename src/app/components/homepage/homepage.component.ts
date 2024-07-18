import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { EditorialsService } from "src/app/shared/_services/editorials.service";
import { EditorialsService as ES } from "../../features/editorials/_services/editorials.service";
import { UserLocationService } from "src/app/shared/_services/user-location.service";
import { City } from "src/app/shared/_models/city.model";
import { EventData } from "src/app/shared/_models/event.model";
import { AiData } from "src/app/shared/_models/ai.model";
import { disable } from "ol/rotationconstraint";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Subscription } from "rxjs";

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
  // providers: [MatDialog ,  { provide: MAT_DIALOG_DATA, useValue: {} }, ]
})
export class HomepageComponent implements OnInit, OnDestroy {
  destinations: any[] = [];
  popularDestinations: any[] = [];
  vacations = [];
  events: EventData[] = [];
  aiItems: AiData[] = [];
  recommendedActivities = [];
  nearActivities = [];
  hotels = [];
  places = [];
  location: string;
  holidays: any = [];

  orientation: string;
  responsiveOptions: any;
  visibilityOptions: any;
  isMobile: boolean;

  private readonly subscriptions = new Subscription();

  constructor(
    public router: Router,
    private editorialSrvc: ES,
    private editorialsService: EditorialsService,
    public locationService: UserLocationService,
    private readonly breakPointObserver: BreakpointObserver
  ) {
    //this.setLanguage();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    localStorage.removeItem("location");
    localStorage.removeItem("filterType");
    localStorage.removeItem("filters");
    sessionStorage.removeItem("filterType");
    sessionStorage.removeItem("filters");
    localStorage.removeItem("hotelsFilters");

    this.subscriptions.add(
      this.breakPointObserver
        .observe(["(max-width: 980px)"])
        .subscribe(
          (result) => (this.isMobile = result.breakpoints["(max-width: 980px)"])
        )
    );

    this.holidays = [
      {
        imageUrl: "../../../../assets/images/others/holidays/bestinform-1.png",
        location: "Maldives",
        date: "Autumn 2024",
        state: "Starting",
        price: "1476",
      },
      {
        imageUrl: "../../../../assets/images/others/holidays/bestinform-2.png",
        location: "Greece",
        date: "Autumn 2024",
        state: "Starting",
        price: "1476",
      },
      {
        imageUrl: "../../../../assets/images/others/holidays/bestinform-3.png",
        location: "Carraibean",
        date: "Autumn 2024",
        state: "Starting",
        price: "1476",
      },
    ];

    this.places = [
      {
        imageUrl: "../../../../assets/images/others/places/place1.png",
        cardText: {
          title: "Ruka IZAKAYA",
          action: "Rezerva acum",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/places/place2.png",
        cardText: {
          title: "La Brasserie",
          action: "Rezerva acum",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/places/place3.png",
        cardText: {
          title: "Nido Kitchen & Bar",
          action: "Rezerva acum",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/places/place4.png",
        cardText: {
          title: "Museum of Senses",
          action: "Cumpara bilet",
        },
        disabled: true,
      },
      {
        imageUrl: "../../../../assets/images/others/places/place5.png",
        cardText: {
          title: "Parcul Regele Mihai I",
          action: "Intrare libera",
        },
        disabled: true,
      },
      {
        imageUrl: "../../../../assets/images/others/places/place6.png",
        cardText: {
          title: "Locked in - Escape",
          action: "Cumpara bilet",
        },
        disabled: true,
      },
    ];
    this.orientation = "horizontal";
    this.responsiveOptions = [
      {
        breakpoint: "800px",
        numVisible: 1.5,
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
    this.recommendedActivities = [
      {
        imageUrl: "../../../../assets/images/others/activities/1.png",
        cardText: {
          title: "Cumpara Bilet",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/activities/2.png",
        cardText: {
          title: "Viziteaza Muzeul de Arta",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/activities/3.png",
        cardText: {
          title: "Rezerva-ti masa Loft Mamaia 1 Mai",
        },
      },
    ];
    this.nearActivities = [
      {
        imageUrl: "../../../../assets/images/others/activities/4.png",
        cardText: {
          title: "Nume Activitate",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/activities/5.png",
        cardText: {
          title: "Nume Activitate",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/5.png",
        cardText: {
          title: "Nume Activitate",
        },
      },
    ];
    this.vacations = [
      {
        imageUrl: "../../../../assets/images/others/image-card/new-york.png",
        cardText: {
          title: "New York, USA",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/santorini.png",
        cardText: {
          title: "Santorini, Grecia",
        },
      },
      {
        imageUrl: "../../../../assets/images/others/image-card/geneva.png",
        cardText: {
          title: "Geneva, Swiss",
        },
      },
    ];
    this.events = [
      {
        cardText: {
          title: "Petrecere",
          address: "București, Romania",
          date: "22 May 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50",
        },
        type: "Petrecere",
        imageUrl: "../../../assets/images/others/events/event2.png",
        disabled: true,
      },
      {
        cardText: {
          title: "Teatru",
          address: "București, Romania",
          date: "5 May 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50",
        },
        type: "Teatru",
        imageUrl: "../../../assets/images/others/events/event1.png",
        disabled: true,
      },
      {
        cardText: {
          title: "Concert",
          address: "București, Romania",
          date: "2 May 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50",
        },
        type: "Concert",
        imageUrl: "../../../assets/images/others/events/event3.png",
        disabled: true,
      },
      {
        cardText: {
          title: "Vernisaj",
          address: "București, Romania",
          date: "10 May 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50",
        },
        type: "Expozitie",
        imageUrl: "../../../assets/images/others/events/event4.png",
        disabled: true,
      },
      {
        cardText: {
          title: "Street Food Festival",
          address: "București, Romania",
          date: "10 May 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50 lei",
        },
        type: "Petrecere",
        imageUrl: "../../../assets/images/others/events/4.png",
      },
      {
        cardText: {
          title: "Street Food Festival",
          address: "București, Romania",
          date: "10 Mai 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50 lei",
        },
        type: "Petrecere",
        imageUrl: "../../../assets/images/others/events/4.png",
      },
      {
        cardText: {
          title: "Street Food Festival",
          address: "București, Romania",
          date: "10 Mai 2024",
          specifity: "Specific: Italian, Mediteranean",
          price: "50 lei",
        },
        type: "Petrecere",
        imageUrl: "../../../assets/images/others/events/4.png",
      },
    ];
    this.hotels = [
      {
        cardText: {
          title: "Nume Hotel",
          address: "Bucuresti, Romania",
        },
        rating: 5,
        imageUrl: "../../../assets/images/others/events/1.png",
      },
      {
        cardText: {
          title: "Nume Hotel",
          address: "Mamaia, Romania",
        },
        rating: 4,
        imageUrl: "../../../assets/images/others/events/2.png",
      },
      {
        cardText: {
          title: "Nume Hotel",
          address: "Bucuresti, Romania",
        },
        rating: 3,
        imageUrl: "../../../assets/images/others/events/3.png",
      },
      {
        cardText: {
          title: "Nume Hotel",
          address: "Bucuresti, Romania",
        },
        rating: 2,
        imageUrl: "../../../assets/images/others/events/4.png",
      },
    ];
    this.aiItems = [
      {
        imageUrl: "../../../../assets/images/others/ai/ai-event-clear-2.png",
        cardText: {
          title: "AI Itineraries",
          text: "Geneaza un itinerariu personalizat bazat pe nevoile si dorintele tale cu ajutorul AI-ului nostru.",
          action: "Creaza Itinerariu",
        },
        disabled: true,
      },
      {
        imageUrl: "../../../../assets/images/others/ai/ai-event-clear-1.png",
        cardText: {
          title: "AI Virtual Assistent",
          text: "Planifica-ti urmatoarea vacanta cu ajutorul asistentului inteligent Bestinform ",
          action: "Incepe Acum",
        },
        disabled: true,
      },
    ];

    this.locationService
      .getCurrentUser()
      .subscribe((user) => (this.location = user.city));
    this.handleEditorialsContent();
  }

  private handleEditorialsContent(): void {
    this.editorialsService.getEditorialCategories().subscribe((categories) => {
      this.editorialSrvc
        .listEditorialFiltered(0, 9, "date", "desc", {
          category: "64198991f6f1ab5b0e46b61a",
        })
        .subscribe((values: any) => {
          this.popularDestinations = values.content.map((item) => ({
            imageUrl: item.featuredImage,
            cardText: {
              title:
                (item.location?.[0] || "") +
                (item.location?.[0] && item.location?.[1] ? ", " : "") +
                (item.location?.[1] || ""),
            },
            slug: item?.slug,
            type: "editorial",
            category: categories?.find((category) => {
              return category.id === item?.category;
            })?.name,
          }));
          console.log("popular destinations", this.popularDestinations);
        });
      this.editorialSrvc
        .listEditorialFiltered(0, 9, "date", "desc", {
          excludeCategory: "64198991f6f1ab5b0e46b61a",
        })
        .pipe()
        .subscribe((values: any) => {
          this.destinations = values.content.map((item) => ({
            imageUrl: item.featuredImage,
            cardText: {
              title: item?.title,
              description: item?.shortDescription,
            },
            slug: item?.slug,
            type: "editorial",
            category: categories?.find((category) => {
              return category.id === item?.category;
            })?.name,
          }));
          console.log(
            "categories",
            this.editorialsService.editorialsCategories
          );
          console.log("destinations", this.destinations);
        });
    });
    // this.editorialSrvc.listEditorialFiltered(0, 9, 'date', 'desc', {category: '64198991f6f1ab5b0e46b61a'}).subscribe((values: any) => {
    //   this.popularDestinations = values.content.map(item => ({
    //     imageUrl: item.featuredImage,
    //     cardText: {title: (item.location?.[0] || '') + (item.location?.[0] && item.location?.[1] ? ', ' : '') + (item.location?.[1] || '')},
    //     slug: item?.slug,
    //     type: 'editorial',
    //     category: this.editorialsService.editorialsCategories?.find(category => { return category.id === item?.category })?.name
    //   }));
    //   console.log('popular destinations', this.popularDestinations);
    // });
    //   this.editorialSrvc.listEditorialFiltered(0, 9, 'date', 'desc', {excludeCategory: '64198991f6f1ab5b0e46b61a'}).pipe(
    //   ).subscribe((values: any) => {
    //       this.destinations = values.content.map(item => ({
    //           imageUrl: item.featuredImage,
    //           cardText: {title: item?.title, description: item?.shortDescription},
    //           slug: item?.slug,
    //           type: 'editorial',
    //           category: this.editorialsService.editorialsCategories?.find(category => { return category.id === item?.category })?.name
    //       }));
    //     console.log('categories', this.editorialsService.editorialsCategories);
    //     console.log('destinations', this.destinations);
    //   });
  }

  SeeMoreEvents() {
    this.router.navigate(["/hotels"]);
  }

  handleGoToEditorials(category?: string): void {
    this.router.navigate(["client/dashboard/editorials"], {
      queryParams: { category },
    });
  }

  handleGoToPlan() {
    this.router.navigate(["/plans"]);
  }

  handleGoToStart() {
    this.router.navigate(["/plans"]);
  }
  redirectBySlug(slug: string): void {
    this.router.navigate([`/client/dashboard/editorials/${slug}`]);
  }

  getImgUrl(url: string): string {
    console.log("url", url);
    return url;
  }
}
