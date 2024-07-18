import {
    Component, ElementRef, HostListener, OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import {BehaviorSubject, Observable, of, skipWhile, Subject, switchMap, take, tap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ResourceFilterService} from "../../../shared/_services/resource-filter.service";
import {map, takeUntil} from "rxjs/operators";
import {Resource} from "../../../shared/_models/resource.model";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {ResourcesService} from "../../../shared/_services/resources.service";

@Component({
    selector: "app-view-simple-resource",
    templateUrl: "./view-simple-resource.component.html",
    styleUrls: ["./view-simple-resource.component.scss"],
})
export class ViewSimpleResourceComponent implements OnInit, OnDestroy {

    @ViewChild('resourceTabs') resourceTabs: ElementRef;
    isBiggerThan981 = false;

    domainId: string;
    categoryId: string;
    resourceTypeId: string;
    resourceId: string;

    allowedToClickBtn = true;

    resourceData: Resource = null;
    roundedReviewPercentage: number;

    resourceTypeName: string;

    activeResourceTabId = 1;

    isItineraryModal = false;
    listingCards;
    resourceDetails;
    selectedMenu = "Prezentare";
    private ngUnsubscribe = new Subject<void>();
    selected = "";
    private restaurantImagesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public restaurantImages$: Observable<any> = this.restaurantImagesSubject.asObservable();
    public imageUrls: any[] = [];

    private restaurantInfoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public restaurantInfo$: Observable<any> = this.restaurantInfoSubject.asObservable();
    public images$: Observable<any> = new Observable<any>();

    public featuredRestaurantImage: any;
    public restaurantName: string = "";

    constructor(
        private route: ActivatedRoute,
        private resourceFilterService: ResourceFilterService,
        private resourcesService: ResourcesService,
        private router: Router,
        private translate: TranslateService,
        private toastService: ToastService,
        private resourcesFilterService: ResourceFilterService,
        private activatedRoute: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.checkRoute();
        this.getResourceInfo();
        this.checkWidth();
        this.getImages();
        this.listingCards = this.getSliderCards();
    }

    setSelectedCard(card) {
        this.selectedMenu = card.cardText.title;
    }

    private getImages(): void {
        if (this.selected === "restaurants") {
            this.resourcesFilterService
                .getRestaurantById(this.resourceId)
                .pipe(
                    take(1),
                    tap(items => {
                        console.log(items)
                    })
                ).subscribe(data => {
                console.log(data)
                this.restaurantName = data.name;
                this.featuredRestaurantImage = `url(${data.featuredImage})`;
                this.imageUrls = data.images;
            })
    }
   }

    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        this.checkWidth();
    }

    checkWidth(): void {
        this.isBiggerThan981 = window.innerWidth > 980;
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();
    }

    getResourceInfo() {
        this.route.paramMap.forEach((params) => {
            this.resourceId = params.get("resourceId");
        });
    }

    checkRoute() {
        this.route.paramMap
            .pipe(
                skipWhile(res => res === null),
                take(1),
                tap((params) => {
                    if (params.has("domainId")) {
                        this.domainId = params.get("domainId");
                    }
                    if (params.has("categoryId")) {
                        this.categoryId = params.get("categoryId");
                        switch (this.categoryId) {
                            case "63d2ae569d6ce304608d1a88":
                                this.selected = "hotels";
                                break;
                            case "63dbb183df393f737216183c":
                                this.selected = "restaurants";
                                break;
                            default:
                                this.selected = "";
                                break;
                        }
                    }
                    if (params.has("resourceTypeId")) {
                        this.resourceTypeId = params.get("resourceTypeId");
                    }
                    if (params.has("resourceId")) {
                        this.resourceId = params.get("resourceId");
                    }
                }),
                switchMap(() => {
                    return this.resourceFilterService.getResourceById(this.resourceId, this.selected === "hotels");
                }),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.activeResourceTabId = 1;
                        this.resourceData = {...res};
                        this.roundedReviewPercentage =
                            Math.ceil(this.resourceData.proReviewsPercentage / 20) * 20;

                        // doar pt afisarea numelui tipului de resursa
                        this.resourceFilterService.resourceTypeObs$
                            .pipe(
                                take(1),
                                switchMap((resourceType) => {
                                    if (!resourceType && res?.id !== undefined) {
                                        return this.resourcesService
                                            .getResourceTypeById(res.id)
                                            .pipe(
                                                take(1),
                                                tap((resourceType) =>
                                                    this.resourceFilterService.setResourceType(
                                                        resourceType,
                                                    ),
                                                ),
                                            );
                                    }
                                    return of(resourceType);
                                }),
                                takeUntil(this.ngUnsubscribe),
                            )
                            .subscribe((resourceType) => {
                                console.log("call for resource type");
                                if (resourceType) {
                                    this.resourceTypeName = resourceType.nameEn;
                                    this.route.queryParams.subscribe({
                                        next: (queryParams) => {
                                            console.log("qp", queryParams);
                                            // TODO: do we need reservation for hotels (we dont have a point in menu).
                                            if (queryParams.selectedTab === "reservation") {
                                                this.selectedMenu = "reservation";
                                            }

                                            if (queryParams.book === "ticket") {
                                                this.navigateToBookingTypeTab();
                                            }
                                        },
                                    });
                                }
                            });
                    }
                },
                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error",
                    );
                    void this.router.navigate([`/client/domain/${this.domainId}`]);
                },
            });
    }

    toggleFavorite() {
        if (!this.allowedToClickBtn) return;

        this.allowedToClickBtn = false;

        if (!this.resourceData.favorite) {
            this.resourcesService
                .addResourceToFavorite(this.resourceData.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resourceData.favorite = true;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Added ${this.resourceData.title} to favorites`,
                            "success",
                        );
                    },
                    error: () => {
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant("TOAST.SERVER-ERROR"),
                            "error",
                        );
                    },
                });
        } else {
            this.resourcesService
                .deleteResourceFromFavorite(this.resourceData.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resourceData.favorite = false;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Removed ${this.resourceData.title} from favorites`,
                            "success",
                        );
                    },
                    error: () => {
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant("TOAST.SERVER-ERROR"),
                            "error",
                        );
                    },
                });
        }
    }

    navigateToBookingTypeTab() {
        this.activeResourceTabId =
            this.resourceData.bookingType === "menu" &&
            this.resourceData.bookingTimePickerId
                ? 4
                : 2;
        this.resourceTabs.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    getSliderCards() {
        switch (this.selected) {
            case "restaurants":
                return [
                    {
                        imageUrl: "../../../../assets/images/others/image-card/1.png",
                        cardText: {
                            title: "Prezentare",
                        },
                        selected: true
                    },
                    {
                        imageUrl: "../../../../assets/images/others/image-card/2.png",
                        cardText: {
                            title: "Meniu",
                        },
                        selected: false
                    },
                    {
                        imageUrl: "../../../../assets/images/others/image-card/3.png",
                        cardText: {
                            title: "Rezervari",
                        },
                        selected: false
                    },
                ];
            case "hotels":
                return [
                    {
                        imageUrl: "../../../../assets/images/others/image-card/1.png",
                        cardText: {
                            title: "Prezentare",
                        },
                    },
                    {
                        imageUrl: "../../../../assets/images/others/image-card/4.png",
                        cardText: {
                            title: "Camere",
                        },
                    },
                    {
                        imageUrl: "../../../../assets/images/others/image-card/3.png",
                        cardText: {
                            title: "Facilitati  ",
                        },
                    },
                ];
        }
    }
}
