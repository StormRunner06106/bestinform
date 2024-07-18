import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Resource} from "../../shared/_models/resource.model";
import {ResourceTemplate} from "../../shared/_models/resource-template.model";
import {ResourcesService} from "../../shared/_services/resources.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-resource-card-with-template',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './resource-card-with-template.component.html',
    styleUrls: ['./resource-card-with-template.component.scss']
})
export class ResourceCardWithTemplateComponent implements OnInit, OnDestroy {

    @Input() cardType: "short" | 'short-w-100' | "long";
    @Input() resourceTypeName: string;
    @Input() resourceData: Resource;
    @Input() resourceTemplate: ResourceTemplate;
    @Input() htmlDescription: boolean;
    @Input() isMyJob: boolean;

    roundedReviewPercentage: number = null;

    allowedToClickBtn = true;

    listingAttributes: Array<{
        attributeId?: string;
        attributeName?: string;
        attributeValue?: string;
        attributeIconPath?: string;
        attributeCategory?: string;
    }> = [];

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourcesService: ResourcesService,
                private toastService: ToastService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.roundedReviewPercentage = Math.ceil(this.resourceData.proReviewsPercentage / 20) * 20;
        this.getListingAttributes();
    }

    getListingAttributes(): void {
        this.listingAttributes = [];

        if (!this.resourceTemplate) return;

        if (this.resourceData.attributes?.length > 0) {
            this.resourceData.attributes.forEach(attribute => {
                if (attribute.tabAttributes?.length > 0) {
                    attribute.tabAttributes.forEach(tabAttribute => {
                        if (this.resourceTemplate?.listingSetting?.attributes?.find(element => element === tabAttribute.attributeId)) {
                            this.listingAttributes.push(tabAttribute);
                        }
                    });
                }
            });
        }
    }

    toggleFavorite() {
        if (!this.allowedToClickBtn) return;

        this.allowedToClickBtn = false;

        if (!this.resourceData.favorite) {
            this.resourcesService.addResourceToFavorite(this.resourceData.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resourceData.favorite = true;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Added ${this.resourceData.title} to favorites`,
                            'success'
                        );
                    },
                    error: () => {
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant('TOAST.SERVER-ERROR'),
                            'error'
                        );
                    }
                });
        } else {
            this.resourcesService.deleteResourceFromFavorite(this.resourceData.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resourceData.favorite = false;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Removed ${this.resourceData.title} from favorites`,
                            'success'
                        );
                    },
                    error: () => {
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant('TOAST.SERVER-ERROR'),
                            'error'
                        );
                    }
                });
        }

    }



    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
