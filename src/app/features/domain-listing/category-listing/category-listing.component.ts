import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, switchMap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {Category} from "../../../shared/_models/category.model";
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";


@Component({
    selector: 'app-category-listing',
    templateUrl: './category-listing.component.html',
    styleUrls: ['./category-listing.component.scss']
})
export class CategoryListingComponent implements OnInit, OnDestroy {

    domainId: string;

    categoryId: string;
    categoryData: Category = null;
    colArray = [];

    currentLanguage: string;

    listOfResourceTypes: ResourceType[] = [];

    private ngUnsubscribe = new Subject<void>();

    constructor(private route: ActivatedRoute,
                private resourcesService: ResourcesService,
                private router: Router,
                private toastService: ToastService,
                private translate: TranslateService,
                private settingsService: SystemSettingsService) {
    }

    ngOnInit(): void {
        this.checkLanguage();
        this.checkRoute();
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

    checkRoute() {
        this.route.paramMap
            .pipe(
                switchMap(params => {
                    if (params.has('domainId')) {
                        this.domainId = params.get('domainId');
                    }

                    if (params.has('categoryId')) {
                        this.categoryId = params.get('categoryId');
                        return this.resourcesService.getResourceCategoryById(this.categoryId)
                            .pipe(
                                switchMap(resourceData => {
                                    this.categoryData = resourceData;
                                    console.log('CATEGORY DATA', this.categoryData );

                                    return this.resourcesService.getAllResourceTypesByResourceCategory(this.categoryId);
                                })
                            )
                    }
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    this.listOfResourceTypes = res;
                    console.log('List of res 0', this.listOfResourceTypes)

                    if(this.categoryData.hasFitnessForum && this.categoryData.hasNutritionForum) {
                        this.settingsService.getSystemSetting().subscribe((resp: any) => {
                            if (resp.fitnessForum.enable) {
                                this.listOfResourceTypes.push({
                                    nameRo: resp.fitnessForum.nameRo,
                                    nameEn: resp.fitnessForum.nameEn,
                                    image: resp.fitnessForum.image,
                                    routeOption: 'forum/fitness'
                                })
                            }
                            if (resp.nutritionForum.enable) {
                                this.listOfResourceTypes.push({
                                    nameRo: resp.nutritionForum.nameRo,
                                    nameEn: resp.nutritionForum.nameEn,
                                    image: resp.nutritionForum.image,
                                    routeOption: 'forum/nutrition'
                                })
                            }
                            console.log('List of res 1', this.listOfResourceTypes)
                            this.colArray = [];
                            this.generateColArray(this.listOfResourceTypes.length);
                        })

                    } else {
                        console.log('List of res 2', this.listOfResourceTypes)
                        this.colArray = [];
                        this.generateColArray(this.listOfResourceTypes.length);
                    }

                },
                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error");

                    void this.router.navigate(['/client/domain', this.domainId]);
                }
            });
    }

    generateColArray(nrOfElements: number) {
        const colMatrix: Array<number[]> = [[]];
        let colRow = 0;

        if (nrOfElements <= 5) {
            for (let i = 0; i < nrOfElements; i++) {
                if (colMatrix[colRow]) {
                    if (colMatrix[colRow].length < 2) {
                        colMatrix[colRow].push(6);
                    } else {
                        colMatrix.push([6]);
                        colRow++;
                    }
                }
            }
        } else {
            for (let i = 0; i < nrOfElements; i++) {
                if (colMatrix[colRow]) {
                    if (colMatrix[colRow].length < 3) {
                        colMatrix[colRow].push(6);
                    } else {
                        colMatrix.push([6]);
                        colRow++;
                    }
                }
            }
        }

        colMatrix.forEach(row => {
            row.forEach( () => {
                this.colArray.push(12 / row.length);
            });
        });

        console.log(colMatrix);
        console.log(this.colArray);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
