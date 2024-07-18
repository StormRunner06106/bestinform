import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {JobsStore} from "../../_services/jobs.store";
import {Attribute} from "../../../../shared/_models/attribute.model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ResourceFilters} from "../../../../shared/_models/resource-filters.model";

@Component({
    selector: 'app-jobs-sidebar',
    templateUrl: './jobs-sidebar.component.html',
    styleUrls: ['./jobs-sidebar.component.scss']
})
export class JobsSidebarComponent implements OnInit, OnDestroy {
    @Output() filtersSubmitted = new EventEmitter<void>();

    filterAttributes: Attribute[] = [];

    resourceTitleToSearch: ResourceFilters['title'] = null;

    filtersForm = new FormGroup({});
    anyFilterSelected = false;

    private ngUnsubscribe = new Subject<void>();

    constructor(private jobsStore: JobsStore,
                private toastService: ToastService,
                private translate: TranslateService,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.getFilterAttributes();
    }

    getFilterAttributes() {
        this.jobsStore.getFilterAttributesFromTemplate()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.filterAttributes = [...res];
                    console.log(this.filterAttributes);

                    this.initFilterForm();
                },
                error: () => {
                    this.toastService.showToast(
                        this.translate.instant('TOAST.ERROR'),
                        this.translate.instant('TOAST.SERVER-ERROR'),
                        'error');
                }
            });
    }

    initFilterForm() {
        if (!this.filterAttributes) {
            return;
        }

        // DO NOT DELETE
        /*this.filterAttributes.forEach( attribute => {
            if (attribute.valueType === 'select') {
                this.filtersForm.addControl(attribute.name, this.fb.control(false));

            } else if (attribute.valueType === 'multiple-select') {
                const newFormGroup = this.fb.group({});
                if (attribute.valueOptions) {
                    attribute.valueOptions.forEach( valueOption => {
                        newFormGroup.addControl(valueOption, this.fb.control(false));
                    });
                }
                this.filtersForm.addControl(attribute.name, newFormGroup);
            }
        });*/

        this.filterAttributes.forEach( attribute => {
            const newFormGroup = this.fb.group({});
            if (attribute.valueOptions) {
                attribute.valueOptions.forEach( valueOption => {
                    newFormGroup.addControl(valueOption, this.fb.control(false));
                });
            }
            this.filtersForm.addControl(attribute.name, newFormGroup);
        });

        this.listenToFormChanges();
    }

    listenToFormChanges() {
        this.filtersForm.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( newValue => {
                for (const objectKey of Object.keys(newValue)) {
                    const formControls = newValue[objectKey];
                    this.anyFilterSelected = Object.values(formControls).some(value => value === true);
                    if (this.anyFilterSelected) {
                        break;
                    }
                }
            });
    }

    searchByTitle() {
        const filtersToSend: ResourceFilters = {
            title: this.resourceTitleToSearch
        };

        this.jobsStore.updateFilters(filtersToSend);
    }

    applyFilters() {
        this.filtersSubmitted.emit();

        const filtersToSend: ResourceFilters = {
            attributes: []
        };

        Object.keys(this.filtersForm.controls).forEach( abstractControlName => {
            const abstractControl = this.filtersForm.get(abstractControlName);

            // DO NOT DELETE
            /*if (abstractControl instanceof FormControl) {
                if (abstractControl.value) {
                    filtersToSend.attributes.push({
                        attributeName: abstractControlName,
                        attributeValue: abstractControl.value
                    });
                }
            } else if (abstractControl instanceof FormGroup) {
                const attributeValues = Object.keys(abstractControl.controls).map( control => {
                    if (this.filtersForm.get([abstractControlName, control]).value) {
                        return control;
                    }
                    return null;
                }).filter( value => value);

                if (attributeValues.length > 0) {
                    filtersToSend.attributes.push({
                        attributeName: abstractControlName,
                        attributeValue: attributeValues.join(',')
                    });
                }
            }*/

            if (abstractControl instanceof FormGroup) {
                const attributeValues = Object.keys(abstractControl.controls).map( control => {
                    if (this.filtersForm.get([abstractControlName, control]).value) {
                        return control;
                    }
                    return null;
                }).filter( value => value);

                if (attributeValues.length > 0) {
                    filtersToSend.attributes.push({
                        attributeName: abstractControlName,
                        attributeValue: attributeValues.join(',')
                    });
                }
            }


        });

        if (filtersToSend.attributes.length === 0) {
            this.jobsStore.updateFilters({attributes: null});
            return;
        }

        this.jobsStore.updateFilters(filtersToSend);
    }

    resetFilters() {
        this.filtersForm.reset();

        this.jobsStore.updateFilters({attributes: null});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
