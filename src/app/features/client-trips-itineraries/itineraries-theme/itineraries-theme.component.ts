import {Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {combineLatest, Observable, shareReplay, startWith, Subject, switchMap} from "rxjs";
import {ItinerariesStore} from "../_services/itineraries.store";
import {Attribute} from "../../../shared/_models/attribute.model";
import {map, takeUntil} from "rxjs/operators";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {AbstractControl, FormArray, FormBuilder, ValidatorFn, Validators} from "@angular/forms";
import * as moment from "moment/moment";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CityRecommendation} from "../../../shared/_models/city-recommendation.model";
import {ResourceFilterService} from "../../../shared/_services/resource-filter.service";

interface InfoForItinerary {
    systemSettings: SystemSetting;
    journeyThemes: Attribute[];
    typesOfDestination: Attribute[];
    typesOfJourney: Attribute[];
}

@Component({
    selector: 'app-itineraries-theme',
    templateUrl: './itineraries-theme.component.html',
    styleUrls: ['./itineraries-theme.component.scss']
})
export class ItinerariesThemeComponent implements OnInit, OnDestroy {

    @ViewChildren('innerAccordion') innerAccordions: QueryList<NgbAccordion>;
    @ViewChild('destinationsAccordion') destinationsAccordion: NgbAccordion;

    allData$: Observable<InfoForItinerary>;

    isManualItinerary = false;
    isRoadTrip = false;


    currentDay = moment();
    nextDay = this.currentDay.clone().add(1, 'days');
    /*currentDay = moment('2023-06-15');
    nextDay = moment('2023-06-17');*/
    extraInfo = this.fb.nonNullable.group({
        startDate: [this.currentDay, Validators.required],
        endDate: [this.nextDay, Validators.required],
        adultsNumber: [1, [Validators.min(1), Validators.required]],
        childrenNumber: [0, Validators.min(0)],
        roomsNumber: [1, Validators.min(0)],
        breakfastHour: ['09:00', Validators.required],
        lunchHour: ['13:00', Validators.required],
        dinnerHour: ['19:00', Validators.required],
        destinations: this.fb.nonNullable.array([
            this.fb.nonNullable.group({
                startDate: [this.currentDay, Validators.required],
                endDate: [this.nextDay, Validators.required],
                location: [null, Validators.required]
            }, {validators: this.startEndDateValidator})
        ])
    }, {validators: this.startEndDateValidator});
    formBtnClicked = false;

    selectedJourneyTheme: Attribute = null;
    selectedDestinationType: Attribute = null;
    selectedJourneyType: Attribute = null;

    recommendedCities: CityRecommendation[] = null;
    cityToSearch: string = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private itinerariesStore: ItinerariesStore,
                private fb: FormBuilder,
                private toastService: ToastService,
                private translate: TranslateService,
                private router: Router,
                private route: ActivatedRoute,
                private resourceFilterService: ResourceFilterService) {
    }

    ngOnInit(): void {
        this.itinerariesStore.resetStoreStates();
        this.checkIfManualOrAI();
        this.getInfoForItineraryGeneration();
    }

    checkIfManualOrAI() {
        if (this.route.snapshot?.data?.itineraryType === 'manual') {
            this.isManualItinerary = true;
        }
    }

    getInfoForItineraryGeneration() {
        const systemSettings$ = this.itinerariesStore.getSystemSetting()
            .pipe(shareReplay(1));

        const journeyThemes$ = systemSettings$.pipe(
            switchMap(systemSettings => this.itinerariesStore.getAttributesByCategoryId(systemSettings.journeyThemeCategoryId, 'roadTrip', 'asc')),
            startWith([])
        );

        const typesOfDestination$ = systemSettings$.pipe(
            switchMap(systemSettings => this.itinerariesStore.getAttributesByCategoryId(systemSettings.typeOfDestinationCategoryId)),
            startWith([])
        );

        const typesOfJourney$ = systemSettings$.pipe(
            switchMap(systemSettings => this.itinerariesStore.getAttributesByCategoryId(systemSettings.typeOfJourneyCategoryId)),
            startWith([])
        );

        this.allData$ = combineLatest([systemSettings$, journeyThemes$, typesOfDestination$, typesOfJourney$])
            .pipe(
                map(([systemSettings, journeyThemes, typesOfDestination, typesOfJourney]) => {
                    return {
                        systemSettings,
                        journeyThemes,
                        typesOfDestination,
                        typesOfJourney
                    }
                })
            );
    }

    startEndDateValidator(form: AbstractControl): ValidatorFn {
        const startDate = form.get('startDate');
        const endDate = form.get('endDate');

        if (endDate.value && startDate.value >= endDate.value) {
            startDate.setErrors({startDateIsHigherOrEqual: true});
        } else {
            if (startDate.hasError('startDateIsHigherOrEqual')) {
                delete startDate.errors['startDateIsHigherOrEqual'];
                startDate.updateValueAndValidity();
            }
        }

        return;
    }

    get destinations(): FormArray {
        return this.extraInfo.get('destinations') as FormArray;
    }

    addDestination() {
        if (this.destinations.controls.at(-1).invalid) return;

        this.cityToSearch = null;

        const lastDate = this.destinations.controls.at(-1).value.endDate;

        this.destinations.push(
            this.fb.group({
                startDate: [lastDate, Validators.required],
                endDate: [lastDate.clone().add(1, 'days'), Validators.required],
                location: [null, Validators.required]
            }, {validators: this.startEndDateValidator})
        );

        setTimeout(() => this.destinationsAccordion.expand((this.destinations.length - 1).toString()));
    }

    removeDestination(destinationIndex: number) {
        this.destinations.removeAt(destinationIndex);
    }

    searchForCities() {
        if (!this.cityToSearch || this.cityToSearch?.length < 3) {
            this.recommendedCities = null;
            return;
        }

        this.resourceFilterService.getAllCitiesRecommended(this.cityToSearch)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                if (!res) return;

                this.recommendedCities = [...res];
            });
    }

    updateLocationValue(destinationIndex: number, city: CityRecommendation | null) {
        this.destinations.at(destinationIndex).get('location').patchValue(city);
    }

    decreaseNrGuests(formControlName: string): void {
        let currentValue = this.extraInfo.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.extraInfo.get(formControlName).patchValue(--currentValue);
    }

    increaseNrGuests(formControlName: string): void {
        let currentValue = this.extraInfo.get(formControlName).value;
        this.extraInfo.get(formControlName).patchValue(++currentValue);
    }

    selectJourneyTheme(journeyTheme: Attribute, innerAccIndex: number) {
        this.innerAccordions.get(innerAccIndex).collapseAll();

        this.selectedJourneyTheme = journeyTheme;
        this.selectedDestinationType = null;
        this.selectedJourneyType = null;
        this.cityToSearch = null;
        this.recommendedCities = null;
        this.formBtnClicked = false;
        this.extraInfo.reset();
    }

    confirmSelection(journeyTheme: Attribute) {
        this.formBtnClicked = true;

        this.extraInfo.get('destinations').enable();

        if (!this.isManualItinerary) {
            if (!journeyTheme?.roadTrip) {
                this.isRoadTrip = false;
                this.extraInfo.get('destinations').disable();
                // this.extraInfo.removeControl('destinations');
            } else {
                this.isRoadTrip = true;
            }
        }
        this.extraInfo.updateValueAndValidity();

        this.extraInfo.markAllAsTouched();

        if (this.extraInfo.valid && this.selectedJourneyTheme && this.selectedDestinationType && this.selectedJourneyType) {

            this.itinerariesStore.setItineraryFilters({
                journeyThemeId: this.selectedJourneyTheme.id,
                typeOfDestinationId: this.selectedDestinationType.id,
                typeOfJourneyId: this.selectedJourneyType.id
            });

            this.itinerariesStore.setItineraryExtraInfo(this.extraInfo.value);
            this.itinerariesStore.setThemeAttributes([this.selectedJourneyTheme, this.selectedDestinationType, this.selectedJourneyType]);

            if (this.isManualItinerary) {
                this.itinerariesStore.setItineraryExtraInfo({itineraryType: 'manual'});
                void this.router.navigate(['itinerary'], {relativeTo: this.route});
            } else {
                if (!this.isRoadTrip) {
                    this.itinerariesStore.setItineraryExtraInfo({itineraryType: 'ai'});
                    void this.router.navigate(['recommended'], {relativeTo: this.route});
                } else {
                    this.itinerariesStore.setItineraryExtraInfo({itineraryType: 'road-trip'});
                    void this.router.navigate(['road-trip'], {relativeTo: this.route});
                }
            }

        } else {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
