import {Component, Input, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Resource} from "../../shared/_models/resource.model";
import {FindPipe} from "../../shared/_pipes/find.pipe";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ResourcesService} from "../../shared/_services/resources.service";
import {ToastService} from "../../shared/_services/toast.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-resource-card',
    standalone: true,
    imports: [CommonModule, FindPipe, TranslateModule],
    templateUrl: './resource-card.component.html',
    styleUrls: ['./resource-card.component.scss']
})
export class ResourceCardComponent implements OnDestroy {

    @Input() resource: Resource;

    allowedToClickBtn = true;
    private ngUnsubscribe = new Subject<void>();

    constructor(private resourcesService: ResourcesService,
                private toastService: ToastService,
                private translate: TranslateService) {
    }

    filterStartHour(attribute: {
        attributeName: string;
        attributeValue: string | number | boolean;
        tabName?: string;
    }): string {
        if (attribute.attributeName === 'Ora de inceput') {
            return attribute.attributeValue.toString();
        }
        return null;
    }

    filterStartDate(attribute: {
        attributeName: string;
        attributeValue: string | number | boolean;
        tabName?: string;
    }): string {
        if (attribute.attributeName === 'Data de inceput') {
            return attribute.attributeValue.toString();
        }
        return null;
    }

    toggleFavorite() {
        if (!this.allowedToClickBtn) return;

        this.allowedToClickBtn = false;

        if (!this.resource.favorite) {
            this.resourcesService.addResourceToFavorite(this.resource.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resource.favorite = true;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Added ${this.resource.title} to favorites`,
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
            this.resourcesService.deleteResourceFromFavorite(this.resource.id)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: () => {
                        this.resource.favorite = false;
                        this.allowedToClickBtn = true;
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            `Removed ${this.resource.title} from favorites`,
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
