import {Component, OnInit} from '@angular/core';
import {firstValueFrom, Observable} from "rxjs";
import {Country} from "../../../shared/_models/country.model";
import {LocationsService} from "../_services/locations.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-countries',
    templateUrl: './countries.component.html',
    styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit {

    countries$: Observable<Country[]>;

    constructor(private locationsService: LocationsService,
                private toastService: ToastService,
                private translate: TranslateService,
                public modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.countries$ = this.locationsService.getCountryList();
    }

    deleteCountry(countryId: string, countryIndex: number, countriesRef: Country[]) {
        firstValueFrom(this.locationsService.deleteCountry(countryId))
            .then( res => {
                if (res.success) {
                    countriesRef.splice(countryIndex, 1);

                    this.modalService.dismissAll();

                    this.toastService.showToast(
                        this.translate.instant("TOAST.SUCCESS"),
                        'Successfully deleted country',
                        'success'
                    );
                }
            })
            .catch( () => {
                this.toastService.showToast(
                    this.translate.instant("TOAST.ERROR"),
                    this.translate.instant("TOAST.SERVER-ERROR"),
                    "error");
            });
    }

}
