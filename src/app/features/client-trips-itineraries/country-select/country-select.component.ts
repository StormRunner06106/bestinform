import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Country } from "../../../shared/_models/country.model";
import { SystemSetting } from "../../../shared/_models/system-setting.model";
import { SystemSettingsService } from "../../../shared/_services/system-settings.service";
import { TripsStore } from "../_services/trips.store";

@Component({
    selector: 'app-country-select',
    templateUrl: './country-select.component.html',
    styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit, OnDestroy {

    systemSetting: SystemSetting = null;

    countries: Country[] = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private tripsStore: TripsStore,
                private systemSettingsService: SystemSettingsService,
                private router: Router,
                private route: ActivatedRoute,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.getCountryList();
        this.getSystemSetting();
    }

    getCountryList() {
        this.tripsStore.getCountryList()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.countries = [...res];
                }
            });
    }

    getSystemSetting() {
        this.systemSettingsService.getSystemSetting()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.systemSetting = {...res};
                }
            });
    }

    selectCountry(country: Country) {
        this.tripsStore.setCountryState(country);
        void this.router.navigate([country.id], {relativeTo: this.route});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();


    }
}
