import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {City} from "../../shared/_models/city.model";
import {FormBuilder, FormGroup, FormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {TranslateModule} from "@ngx-translate/core";
import {CityRecommendation} from "../../shared/_models/city-recommendation.model";
import {takeUntil} from "rxjs/operators";
import {ResourceFilterService} from "../../shared/_services/resource-filter.service";
import {Subject} from "rxjs";
import {MatDialogRef,MatDialog, MatDialogModule} from '@angular/material/dialog';


@Component({
    selector: 'app-confirm-location',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatLegacyFormFieldModule, MatLegacyInputModule, TranslateModule, MatDialogModule],
    templateUrl: './confirm-location.component.html',
    styleUrls: ['./confirm-location.component.scss']
})
export class ConfirmLocationComponent implements OnInit, OnDestroy{
    @Input() detectedCity: City;
    @Input() hasCity: City;


    filterForm: FormGroup;

    recommendedCities: CityRecommendation[] = null;
    cityToSearch: string = null;
    displayChooseLocation=false;

    private ngUnsubscribe = new Subject<void>();

    constructor(public modal: NgbActiveModal,
                private resourceFilterService: ResourceFilterService,
                private fb: FormBuilder,
                public dialog: MatDialog) {
    }

    ngOnInit(): void {
        console.log('hasCity',this.hasCity);
        this.filterForm = this.fb.group({
            location: [this.detectedCity.name],
            geographicalCoordinates: [this.detectedCity.geographicalCoordinates],
            country: [this.detectedCity.country]
        });
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

    updateFormValue(formControlName: string, value: unknown) {
        this.filterForm.get(formControlName).patchValue(value);
    }

    openModal(templateRef) {
        this.dialog.open(templateRef, {panelClass: 'custom-modal'});
        this.modal.close();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
