import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {of, Subject, switchMap} from "rxjs";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {takeUntil} from "rxjs/operators";
import {Attribute} from "../../../../shared/_models/attribute.model";
import {ResourceFilters} from "../../../../shared/_models/resource-filters.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-sidebar-filters',
    templateUrl: './sidebar-filters.component.html',
    styleUrls: ['./sidebar-filters.component.scss'],
    providers: [TitleCasePipe]
})
export class SidebarFiltersComponent implements OnInit, OnDestroy {
    @Output() filtersSubmitted = new EventEmitter<void>();

    filterAttributes: Attribute[] = null;

    resourceTitleToSearch: ResourceFilters['title'] = null;
    resourceAttributesToSearch: ResourceFilters['attributes'] = null;

    filtersForm = new FormGroup({});
    anyFilterSelected = false;

    private ngUnsubscribe = new Subject<void>();
    resourceTypeId: string;
    resouceTypeNameEn: string;

    screenWidth: number;
    showFilters = true;


    constructor(private resourceFilterService: ResourceFilterService,
                private fb: FormBuilder,
                private route:ActivatedRoute) {
        this.onResize();
    }

    ngOnInit(): void {
        this.getResourceType();
        this.listenForTemplateIdAndGetFilterAttributes();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.screenWidth = window.innerWidth;
        this.showFilters = this.screenWidth >= 992;
    }

    listenForTemplateIdAndGetFilterAttributes() {
        this.resourceFilterService.resourceTemplateObs$
            .pipe(
                switchMap( template => {
                    if (template && template.id) {
                        return this.resourceFilterService.getFilterAttributeFromTemplate(template.id);
                    }
                    return of(null);
                }),
                takeUntil(this.ngUnsubscribe)
            ).subscribe({
            next: res => {
                if (!res) {
                    return;
                }
                this.filterAttributes = [...res];
                console.log('aici avem lista de atribute', this.filterAttributes);
                this.initFilterForm();
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
                    console.log('anyFilterSelected',this.anyFilterSelected);
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

        this.resourceFilterService.updateFilters(filtersToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe();
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
            this.resourceFilterService.updateFilters({attributes: null})
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe();
            return;
        }

        this.resourceFilterService.updateFilters(filtersToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe();
    }

    getResourceType(){
        this.route.paramMap
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next:params=>{
                    this.resourceTypeId=params.get('resourceTypeId');
                    this.resourceFilterService.getResourceTypeById(this.resourceTypeId)
                    .subscribe((res:any)=>{
                        this.resouceTypeNameEn=res?.nameEn;
                    });
                }
            });
    }

    titleCaseWord(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1).toLowerCase();
      }

    resetFilters() {
        this.filtersForm.reset();

        this.resourceFilterService.updateFilters({attributes: null})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
