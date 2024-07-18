import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, take} from "rxjs";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {ResourceTemplate} from "../../../../shared/_models/resource-template.model";
import {takeUntil} from "rxjs/operators";
import {Resource} from "../../../../shared/_models/resource.model";
import {ResourcesService} from "../../../../shared/_services/resources.service";
import {OwlOptions} from "ngx-owl-carousel-o";
import {User} from "../../../../shared/_models/user.model";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-resources-carousel',
    templateUrl: './resources-carousel.component.html',
    styleUrls: ['./resources-carousel.component.scss']
})
export class ResourcesCarouselComponent implements OnInit, OnDestroy {

    resourceType: ResourceType = null;
    resourceTemplate: ResourceTemplate = null;
    resourcesList: Resource[] = [];
    resourcesLoaded = false;

    currentLanguage: string;

    currentUser: User = null;

    // carousel config
    customOptions: OwlOptions = {
        autoplay: true,
        loop: false,
        mouseDrag: true,
        touchDrag: true,
        pullDrag: true,
        dots: false,
        dotsEach: 4,
        nav: false,
        navSpeed: 700,
        center: false,
        margin: 24,
        autoWidth: false,
        responsive: {
            0: {
                items: 1
            },
            576: {
                autoWidth: true,
                items: 2
            },
            768: {
                items: 3
            },
            992: {
                items: 4
            },
            1200: {
                autoWidth: true,
                items: 5
            }
        }
    }

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourceFilterService: ResourceFilterService,
                private resourcesService: ResourcesService,
                private currentUserService: UserDataService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.listenToResourceTemplate();
        this.listenToResourceType();
        this.getCurrentUser();
        this.checkLanguage();
    }

    listenToResourceTemplate() {
        this.resourceFilterService.resourceTemplateObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTemplate = {...res};
                }
            });
    }

    listenToResourceType() {
        this.resourceFilterService.resourceTypeObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (!res) return;
                    this.resourceType = res;
                    this.getResourceRecommendations();
                }
            });
    }

    getResourceRecommendations() {
        this.resourcesService.listResourceFiltered(0, 10, null, null, {resourceTypeId: this.resourceType.id, bestForMe: true})
            .pipe(
                take(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    this.resourcesList = res.content.slice();
                    this.resourcesLoaded = true;
                }
            });
    }

    getCurrentUser() {
        this.currentUserService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.currentUser = {...res};
                }
            });
    }

    checkLanguage() {
        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
