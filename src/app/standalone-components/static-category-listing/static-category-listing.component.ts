import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, switchMap} from "rxjs";
import {CategoryPathService} from "../../shared/_services/category-path.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {ResourcesService} from "../../shared/_services/resources.service";
import {SystemSettingsService} from "../../shared/_services/system-settings.service";
import {TranslateService} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";
import {CategoryCardComponent} from "../category-card/category-card.component";

@Component({
    selector: 'app-static-category-listing',
    standalone: true,
    imports: [CommonModule, CategoryCardComponent, RouterLink],
    templateUrl: './static-category-listing.component.html',
    styleUrls: ['./static-category-listing.component.scss']
})
export class StaticCategoryListingComponent implements OnInit, OnDestroy {

    domainId: string;
    staticCategories: string[];
    nextRoute = '';

    pageNameRo: string = null;
    pageNameEn: string = null;
    pathToSettings: string[] = [];

    pathToImg: string[] = [];
    previousCategoryImg: {filePath: string, fileName: string} = null;

    listOfCategoryData = [];
    categoryData = null;

    colArray = [];

    currentLanguage: string;

    private ngUnsubscribe = new Subject<void>();

    constructor(
        private categoryPath: CategoryPathService,
        private route: ActivatedRoute,
        private router: Router,
        private resourcesService: ResourcesService,
        private systemSettings: SystemSettingsService,
        private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.checkLanguage();
        this.checkRouteForCategories();
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

    checkRouteForCategories() {
        this.route.paramMap
            .pipe(
                switchMap(params => {
                    if (params.has('domainId')) {
                        this.domainId = params.get('domainId');
                    }

                    if (params.has('staticCategories')) {
                        this.staticCategories = params.get('staticCategories').split(',');
                        return this.systemSettings.getSystemSetting();
                    }

                    this.staticCategories = [this.route.snapshot.data.module];
                    return this.systemSettings.getSystemSetting();
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    this.listOfCategoryData = [];
                    this.categoryData = null;
                    this.nextRoute = '';
                    [this.pageNameRo, this.pageNameEn, this.pathToSettings, this.pathToImg] = this.categoryPath.getInfoFromRoutePath(this.staticCategories.slice());
                    this.categoryData = this.categoryPath.getInfoFromObjectPath(this.pathToSettings.slice(), res, this.staticCategories.slice());
                    this.previousCategoryImg = this.categoryPath.getImageFromSettingsObject(this.pathToImg, res);

                    for (const key of Object.keys(this.categoryData)) {
                        this.listOfCategoryData.push(key);
                    }

                    this.staticCategories.forEach(category => {
                        this.nextRoute = this.nextRoute + category + ',';
                    });

                    this.colArray = [];
                    this.generateColArray(this.listOfCategoryData.length);
                },
                error: () => {
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
            row.forEach(() => {
                this.colArray.push(12 / row.length);
            });
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
