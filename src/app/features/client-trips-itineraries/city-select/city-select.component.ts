import {Component, OnDestroy, OnInit} from '@angular/core';
import {TripsStore} from "../_services/trips.store";
import {forkJoin, of, Subject, switchMap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Location} from "../../../shared/_models/location.model";
import {Trip} from "../../../shared/_models/trip.model";
import {Country} from "../../../shared/_models/country.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-city-select',
    templateUrl: './city-select.component.html',
    styleUrls: ['./city-select.component.scss']
})
export class CitySelectComponent implements OnInit, OnDestroy {

    trips: Trip[] = null;
    filteredTripsByCityId: Trip[] = null;
    selectedTrip: Trip = null;

    cities: Location[] = null;
    selectedCity: Location = null;

    country: Country = null;
    countryId: string;

    guestsForm: FormGroup = this.fb.group({
        adultsNumber: [0, Validators.min(1)],
        childrenNumber: [0]
    });

    confirmBtnClicked = false;

    private ngUnsubscribe = new Subject<void>();

    constructor(private tripsStore: TripsStore,
                private route: ActivatedRoute,
                private router: Router,
                private fb: FormBuilder,
                private toastService: ToastService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.getLocationListByCountryId();
    }

    getLocationListByCountryId() {
        this.route.paramMap
            .pipe(
                switchMap( params => {
                    if (params.has('countryId')) {
                        this.countryId = params.get('countryId');
                        return forkJoin([
                            this.tripsStore.getLocationListByCountryId(this.countryId),
                            this.tripsStore.getCountryById(this.countryId)
                        ]);
                    }
                    return of(null);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    if (!res) return;

                    [this.cities, this.country] = res;

                    if (this.cities?.length > 0) {
                        this.selectedCity = this.cities[0];
                        this.getTrips();
                    }
                }
            });
    }

    getTrips() {
        this.tripsStore.listTripsFiltered(0, -1, null, null, {countryId: this.countryId, status:'active'})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.trips = [...res.content];

                    if (this.cities?.length > 0) {
                        this.filterTripsByCityId(this.cities[0].id);
                    }
                }
            });
    }

    filterTripsByCityId(cityId: string): void {
        this.selectedTrip = null;
        this.guestsForm.setValue({
            adultsNumber: 0,
            childrenNumber: 0
        });
        this.filteredTripsByCityId = this.trips.filter(trip => trip.locationId === cityId);
    }

    selectTrip(trip: Trip) {
        this.guestsForm.setValue({
            adultsNumber: 0,
            childrenNumber: 0
        });
        if (this.selectedTrip && this.selectedTrip.name === trip.name ) {
            this.selectedTrip = null;
            return;
        }
        this.selectedTrip = {...trip};
    }

    decreaseNrGuests(formControlName: string): void {
        let currentValue = this.guestsForm.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.guestsForm.get(formControlName).patchValue(--currentValue);
    }

    increaseNrGuests(formControlName: string): void {
        let currentValue = this.guestsForm.get(formControlName).value;
        this.guestsForm.get(formControlName).patchValue(++currentValue);
    }

    confirmSelection(): void {
        this.confirmBtnClicked = true;

        if (!this.guestsForm.valid) {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                "Select at least one adult",
                "error");
            return;
        }

        this.tripsStore.setTripState(this.selectedTrip);
        this.tripsStore.setGuestsState(this.guestsForm.value);
        void this.router.navigate(['trip', this.selectedTrip.id], {relativeTo: this.route});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
