import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {LocationsService} from "../_services/locations.service";
import {catchError, forkJoin, of, Subject, switchMap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Country} from "../../../shared/_models/country.model";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {Location} from "../../../shared/_models/location.model";
import {AbstractControl, FormArray, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";


@Component({
    selector: 'app-add-edit-country',
    templateUrl: './add-edit-country.component.html',
    styleUrls: ['./add-edit-country.component.scss'],
    providers: [ModalMediaService]
})
export class AddEditCountryComponent implements OnInit, OnDestroy {

    countryForm = this.fb.group({
        name: ['', Validators.required],
        image: [{
            fileName: '',
            filePath: ''
        }, this.noImageValidator],
        description: ['']
    });

    newLocationForm = this.fb.group({
        name: ['', Validators.required],
        image: [{
            fileName: '',
            filePath: ''
        }, this.noImageValidator],
        description: ['']
    });

    locationsForm = this.fb.group({
        locations: this.fb.array([])
    });

    isEditMode = false;
    countryData: Country = null;
    locationsData: Location[] = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private locationsService: LocationsService,
                private router: Router,
                private route: ActivatedRoute,
                private toastService: ToastService,
                private translate: TranslateService,
                private fb: FormBuilder,
                public modalService: NgbModal,
                private modalMediaService: ModalMediaService) {
    }

    ngOnInit(): void {
        this.listenToRoute();
        this.listenToMedia();
    }

    listenToRoute() {
        this.route.paramMap
            .pipe(
                switchMap( route => {
                    if (route.has('countryId')) {
                        this.isEditMode = true;
                        return forkJoin([
                            this.locationsService.getCountryById(route.get('countryId')),
                            this.locationsService.getLocationListByCountryId(route.get('countryId'))
                                .pipe(catchError(() => of([])))
                        ]);
                    }
                    return of(null);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    if (!res) return;

                    [this.countryData, this.locationsData] = res;

                    this.countryForm.patchValue(this.countryData);

                    this.initLocationsForm();
                },

                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                        "error");
                }
            });
    }

    listenToMedia() {
        this.modalMediaService.currentImagesArray
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((array: any) => {
                if (array?.[0]?.for === 'country-img') {
                    this.countryForm.get('image').setValue(array[0].selectedMedia);
                } else if (array?.[0]?.for.split('-')[0] === 'location') {
                    const locationIndex = array[0].for.split('-')[1];
                    this.locations.controls[locationIndex].get('image').setValue(array[0].selectedMedia);
                } else if (array?.[0]?.for === 'new-location') {
                    this.newLocationForm.get('image').setValue(array[0].selectedMedia);
                }
            });
    }

    noImageValidator(control: AbstractControl): ValidationErrors | null {
        return !control.value?.filePath ? {noImage: true} : null;
    }

    initLocationsForm(): void {
        if (this.locationsData?.length > 0) {
            this.locationsData.forEach( location => {
                this.locations.push(
                    this.fb.group({
                        name: [location?.name, Validators.required],
                        image: [{
                            fileName: location?.image?.fileName,
                            filePath: location?.image?.filePath
                        }, this.noImageValidator],
                        description: [location?.description]
                    })
                );
            });
        } else {
            // this.locationsForm.setValue(null);
        }
    }

    get locations(): FormArray {
        return this.locationsForm.get('locations') as FormArray;
    }

    submitCountry() {
        console.log(this.countryForm.value);
        this.countryForm.markAllAsTouched();
        if (this.countryForm.valid) {
            if (this.isEditMode) {
                this.locationsService.updateCountry(this.countryData.id, this.countryForm.value)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.SUCCESS"),
                                    'Successfully updated country',
                                    'success'
                                );
                                this.countryData = {
                                    ...this.countryData,
                                    ...this.countryForm.value
                                };
                            }
                        },

                        error: () => {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                        }
                    });

            } else {
                this.locationsService.addCountry(this.countryForm.value)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.SUCCESS"),
                                    'Successfully created country',
                                    'success'
                                );

                                void this.router.navigate(['../edit', res.reason], {relativeTo: this.route});
                            }
                        },

                        error: () => {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                        }
                    });
            }
        } else {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
        }
    }

    submitNewLocation() {
        this.newLocationForm.markAllAsTouched();
        if (this.newLocationForm.valid) {
            this.locationsService.addLocation(this.countryData.id, this.newLocationForm.value)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        if (res.success) {
                            const newLocation = {
                                id: res.reason,
                                countryId: this.countryData.id,
                                ...this.newLocationForm.value
                            };

                            this.locationsData.push({...newLocation});

                            this.locations.push(this.fb.group({
                                name: [this.newLocationForm.value.name, Validators.required],
                                image: [{
                                    fileName: this.newLocationForm.value?.image?.fileName,
                                    filePath: this.newLocationForm.value?.image?.filePath
                                }, this.noImageValidator],
                                description: [this.newLocationForm.value?.description]
                            }));

                            this.modalService.dismissAll();

                            this.newLocationForm.reset();

                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                'Successfully created location',
                                'success'
                            );
                        }
                    },

                    error: () => {
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant("TOAST.SERVER-ERROR"),
                            "error");
                    }
                });
        } else {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
        }
    }

    updateLocation(locationIndex: number) {
        const selectedLocation = this.locations.controls[locationIndex];
        selectedLocation.markAllAsTouched();

        if (selectedLocation.valid) {
            this.locationsService.updateLocation(this.locationsData[locationIndex].id, selectedLocation.value)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        if (res.success) {
                            this.locationsData[locationIndex] = {
                                ...this.locationsData[locationIndex],
                                ...selectedLocation.value
                            }

                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                'Successfully updated location',
                                'success'
                            );
                        }
                    },

                    error: () => {
                        this.toastService.showToast(
                            this.translate.instant("TOAST.ERROR"),
                            this.translate.instant("TOAST.SERVER-ERROR"),
                            "error");
                    }
                });

        } else {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
        }
    }

    deleteLocation(locationIndex: number) {
        this.locationsService.deleteLocation(this.locationsData[locationIndex].id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.locationsData.splice(locationIndex, 1);
                    this.locations.removeAt(locationIndex);

                    this.modalService.dismissAll();

                    this.toastService.showToast(
                        this.translate.instant("TOAST.SUCCESS"),
                        'Successfully deleted location',
                        'success'
                    );
                },

                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error");
                }
            });
    }

    openMedia(content: TemplateRef<unknown>) {
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
