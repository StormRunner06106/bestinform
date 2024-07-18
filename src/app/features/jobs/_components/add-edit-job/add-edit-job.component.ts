import {Component, OnInit} from '@angular/core';
import {forkJoin, Observable, of, switchMap} from "rxjs";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {JobsStore} from "../../_services/jobs.store";
import {SystemSettingsService} from "../../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../../shared/_models/system-setting.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {JobService} from "../../_services/job.service";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../../../../shared/_services/toast.service";
import {LocationService} from "../../../../shared/_services/location.service";
import {Resource} from "../../../../shared/_models/resource.model";

@Component({
    selector: 'app-add-edit-job',
    templateUrl: './add-edit-job.component.html',
    styleUrls: ['./add-edit-job.component.scss'],
    providers: [JobsStore]
})
export class AddEditJobComponent implements OnInit {

    isEditMode = false;
    jobSettings: any;
    jobForm: FormGroup;
    jobData: Resource;

    attributeTabs: any;
    attributesArray = [];

    thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    thumbnailFile: Blob;

    countries = [];
    cities = [];

    $fileObservables: Observable<object>[] = [];


    editorConfig: AngularEditorConfig = {
        editable: true,
        height: '300',
        minHeight: '200px',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        enableToolbar: true,
        showToolbar: true,
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Roboto',
        defaultFontSize: '',
        fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
        ],
        customClasses: [
            {
                name: 'Title',
                class: 'format-title'
            },
            {
                name: 'Paragraph',
                class: 'format-paragraph'
            }

        ],
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            ['subscript'],
            ['superscript'],
            ['backgroundColor']
        ]
    };

    formBtnClicked = false;

    constructor(private jobsStore: JobsStore,
                private settingsService: SystemSettingsService,
                private fb: FormBuilder,
                private jobService: JobService,
                private router: Router,
                private route: ActivatedRoute,
                private toastService: ToastService,
                private locationService: LocationService) {
    }

    ngOnInit(): void {
        this.formInit();
        this.getSettings();
        this.getJobResourceType();
        this.getCountries();
        this.checkIfEdit();

    }

    getSettings() {
        this.settingsService.getSystemSetting().subscribe({
            next: (settings: SystemSetting) => {
                this.jobSettings = settings.jobOptions.myJobOffers;
            }
        })
    }

    //Get the domain with unique key 'jobs' and the resourceType for Jobs
    getJobResourceType() {
        this.jobService.getListOfDomains().subscribe({
            next: (domainsList: any) => {
                domainsList.forEach(domain => {
                    if (domain.key === 'jobs') {
                        this.jobForm.get('domain').patchValue(domain.id);
                        this.jobService.getResourceTypesByDomainId(domain.id).subscribe({
                            next: (domainData: any) => {
                                this.jobForm.get('resourceTypeId').patchValue(domainData[0].id);
                                this.jobForm.get('categoryId').patchValue(domainData[0].categoryId);
                                this.getTemplateData(domainData[0].id);
                            }
                        })
                    }
                })
            }
        })
    }

    //Get the attributes from the template
    getTemplateData(resourceTypeId) {
        this.jobService.getListTemplateFiltered(0, -1, null, null, {resourceTypeId: resourceTypeId})
            .subscribe({
                next: (templates: any) => {
                    console.log(templates.content[0]);
                    this.jobService.getAttributesFromTemplate(templates.content[0].id)
                        .subscribe({
                            next: (attributes: any) => {
                                console.log('ATTRS', attributes);
                                if (this.isEditMode) {
                                    this.compareAttributes(this.jobData.attributes, attributes);
                                    this.createInputs(this.attributeTabs);
                                } else {
                                    this.attributeTabs = attributes;
                                    this.createInputs(attributes);
                                }

                            }
                        })
                }
            })
    }

    createInputs(attributes) {
        const attributesForm = this.jobForm.get('attributesForm') as FormGroup;
        for (const section of attributes) {
            const sentionFormGroup = new FormGroup({});
            for (const inputField of section.tabAttributes) {
                if (inputField.valueType === 'toggle') {
                    sentionFormGroup.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : 'false'));
                } else if (inputField.valueType === 'multiple-select') {
                    sentionFormGroup.addControl(inputField.name, new FormControl(inputField.attributeValue ? (inputField.attributeValue).split(',') : []))
                } else {
                    sentionFormGroup.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : '', inputField.propertyRequired ? Validators.required : null));
                }
            }
            attributesForm.addControl(section.tabName, sentionFormGroup);
            console.log('FORM', this.jobForm.value);
        }
    }

    compareAttributes(jobAttr, templateAttributes) {

        this.attributeTabs = [];
        // console.log('res', eventAttr);
        // console.log('temp', templateAttributes);

        templateAttributes.forEach(templateTab => {
                jobAttr.forEach(resourceTab => {
                        //verify if you are in the same tab
                        if (templateTab.tabName === resourceTab.tabName) {
                            const array = [];
                            templateTab.tabAttributes.forEach(templateAttribute => {
                                    if (resourceTab.tabAttributes?.length > 0) {
                                        resourceTab.tabAttributes.forEach(resourceAttribute => {
                                            //see if the attributes have the same id
                                            if (templateAttribute.id === resourceAttribute.attributeId) {
                                                //if they have the same id and the attribute is not already in the array
                                                const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                                if (attributeIndex === -1) {
                                                    //push the attribute from template adding the value from resource
                                                    array.push({
                                                        ...templateAttribute,
                                                        attributeValue: resourceAttribute.attributeValue
                                                    })

                                                }

                                            } else {
                                                //if the attributes dont have the same id, see if you can find it in the resource

                                                const find = resourceTab.tabAttributes.find(attr => attr.attributeId === templateAttribute.id);
                                                const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                                //if the attribute isnt on the resource and it isnt on the array
                                                if (attributeIndex === -1 && !find) {
                                                    //push the attribute with no value
                                                    // console.log('template attr not found', templateAttribute)
                                                    array.push({
                                                        ...templateAttribute,
                                                        attributeValue: ''
                                                    })
                                                }
                                            }


                                        })
                                    } else {
                                        const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                        if (attributeIndex === -1) {
                                            //push the attribute with no value
                                            // console.log('template attr not found', templateAttribute)
                                            array.push({
                                                ...templateAttribute,
                                                attributeValue: ''
                                            })
                                        }
                                    }


                                }
                            )

                            this.attributeTabs.push({
                                tabName: templateTab.tabName,
                                tabAttributes: array
                            })

                        }

                    }
                )

                //after combining the resource attributes with the template attributes, see if you have all the template tabs
                const findTab = this.attributeTabs.find(section => templateTab.tabName === section.tabName);
                // console.log('find tab',findTab);
                //if not, add the tab with the name of the missing one and an empty array
                if (!findTab) {
                    this.attributeTabs.push({
                        tabName: templateTab.tabName,
                        tabAttributes: []
                    })
                }
            }
        )

    }

    formInit() {
        this.jobForm = this.fb.group({
            id: null,
            title: ['', Validators.required],
            shortDescription: ['', Validators.required],
            description: '',
            resourceTypeId: '',
            categoryId: '',
            domain: '',
            bookingType: 'applyToJob',
            address: ['', Validators.required],
            country:  ['', Validators.required],
            city:  ['', Validators.required],
            slug: '',
            attributesForm: this.fb.group({})
        })
    }

    checkIfEdit() {
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                if (params.get('id')) {
                    this.isEditMode = true;
                    return this.jobService.getResourceById(params.get('id'));
                } else {
                    this.isEditMode = false;
                    return of('');
                }
            })
        ).subscribe((job: Resource) => {
            console.log('GET JOB', job);
            this.jobForm.patchValue(job);
            this.jobData = job;

            if (this.isEditMode) {
                if (job.country) {
                    this.getCities(job.country);
                }
                this.thumbnailUrl = Object.assign({}, job.featuredImage);
                // console.log(this.galleryUrls);
                if (!job.featuredImage) {
                    this.thumbnailUrl = {
                        fileName: undefined,
                        filePath: undefined
                    };
                }
            }
        })
    }

    makeAttributesToSend() {
        const formData = [];
        const attributesForm = this.jobForm.get('attributesForm') as FormGroup;

        console.log(attributesForm);

        for (const group in attributesForm.controls) {
            console.log(group);

            const innerGroup = attributesForm.get(group) as FormGroup;
            for (const control in innerGroup.controls) {
                console.log(control);

                this.attributeTabs.forEach((section) => {
                    section.tabAttributes.forEach(attribute => {
                        if (attribute.name === control) {
                            if (attribute.valueType === 'multiple-select') {
                                formData.push({
                                    tabName: section.tabName,
                                    attributeName: control,
                                    attributeId: attribute.id,
                                    attributeValue: Array.isArray(attributesForm.get(group).get(control).value) ? attributesForm.get(group).get(control).value.join() : attributesForm.get(group).get(control).value,
                                    attributeIconPath: attribute.icon.filePath
                                });
                            } else {
                                formData.push({
                                    tabName: section.tabName,
                                    attributeName: control,
                                    attributeId: attribute.id,
                                    attributeValue: attributesForm.get(group).get(control).value,
                                    attributeIconPath: attribute.icon.filePath
                                });
                            }

                        }
                    });
                });
            }

        }
        console.log('FORM DATA', formData);

        const attributes = formData.reduce((acc, item) => {
            const index = acc.findIndex(x => x.tabName === item.tabName);
            if (index !== -1) {
                acc[index].tabAttributes.push({
                    attributeId: item.attributeId,
                    attributeValue: item.attributeValue
                });
            } else {
                acc.push({
                    tabName: item.tabName,
                    tabAttributes: [{
                        attributeId: item.attributeId,
                        attributeValue: item.attributeValue
                    }]
                });
            }
            return acc;
        }, []);

        console.log('ATTRIBUTES', attributes);

        if (attributes.length < 4) {
            if (!attributes.find(t => t.tabName === 'general_info')) {
                attributes.push({
                    tabName: 'general_info',
                    tabAttributes: []
                })
            }

            if (!attributes.find(t => t.tabName === 'about')) {
                attributes.push({
                    tabName: 'about',
                    tabAttributes: []
                })
            }

            if (!attributes.find(t => t.tabName === 'facilities')) {
                attributes.push({
                    tabName: 'facilities',
                    tabAttributes: []
                })
            }

            if (!attributes.find(t => t.tabName === 'contact')) {
                attributes.push({
                    tabName: 'contact',
                    tabAttributes: []
                })
            }
        }

        this.attributesArray = attributes;
        console.log(this.attributesArray);
    }

    clearForm(formControl) {
        this.jobForm.get(formControl).patchValue(null);
    }

    columnSize(size) {
        switch (size) {
            case 'full_row':
                return 'col-12'
            case 'half_row':
                return 'col-md-6 col-12'
            default:
                return 'col-12'
        }
    }

    //Featured image
    onThumbnailChange(event) {
        if (event.target.files && event.target.files[0]) {
            this.thumbnailUrl.fileName = event.target.files[0].name;
            this.thumbnailFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.thumbnailUrl.filePath = reader.result;
            reader.readAsDataURL(this.thumbnailFile);
        }
    }

    removeThumbnail() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };
        this.thumbnailFile = undefined;
    }

    getCountries() {

        this.locationService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
            }
        })
    }

    getCities(event) {
        const country = {
            country: event?.value ? event.value : event
        }
        this.locationService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                // console.log(cities);
                this.cities = cities.content;
            }
        })
    }

    submitJob() {
        this.jobForm.markAllAsTouched();
        this.formBtnClicked = true;

        if (this.jobForm.valid) {
            this.makeAttributesToSend();
            const jobData = {
                ...this.jobForm.value,
                attributes: this.attributesArray
            }
            if (this.isEditMode) {
                this.updateJob(jobData);
            } else {
                console.log('JOB TO SEND', jobData)
                this.addJob(jobData);
            }

        } else {
            this.toastService.showToast('Error', 'Completati toate campurile obligatorii!', "error");
            return
        }

    }

    addJob(jobData) {
        this.jobService.addResource(jobData)
            .subscribe({
                next: (resp: { success: boolean, reason: string }) => {
                    console.log('AFTER ADD', resp);
                    if (resp.success) {
                        if (this.thumbnailFile) {
                            const thumbnailData = new FormData();
                            thumbnailData.append('file', this.thumbnailFile);
                            console.log(thumbnailData)
                            console.log(this.thumbnailFile)

                            this.$fileObservables.push(this.jobService.uploadResourceImage(resp.reason, thumbnailData));
                        }

                        if (this.$fileObservables.length > 0) {
                            forkJoin(...this.$fileObservables).subscribe(() => {
                                this.toastService.showToast('succes', 'Job adaugat cu succes', 'success');
                                // this.router.navigate(['/private/staff/events/list']);
                                this.router.navigate(['../my-job-offers'], {relativeTo: this.route});

                            })

                        }


                        this.toastService.showToast('succes', 'Job adaugat cu succes', 'success');
                        // this.router.navigate(['/private/staff/events/list']);
                        this.router.navigate(['../my-job-offers'], {relativeTo: this.route});
                    }
                }
            })
    }

    updateJob(jobData) {
        this.jobService.updateResource(this.jobForm.value.id, jobData)
            .subscribe({
                next: (resp: { success: boolean, reason: string }) => {
                    if (resp.success) {
                        if (this.thumbnailFile) {
                            const thumbnailData = new FormData();
                            thumbnailData.append('file', this.thumbnailFile);
                            console.log(thumbnailData)
                            console.log(this.thumbnailFile)

                            this.$fileObservables.push(this.jobService.uploadResourceImage(this.jobForm.value.id, thumbnailData));
                        }

                        if (this.$fileObservables.length > 0) {
                            forkJoin(...this.$fileObservables).subscribe(() => {

                            })
                        }

                        this.toastService.showToast('succes', 'Job editat cu succes', 'success');
                        // this.router.navigate(['/private/staff/events/list']);
                        this.router.navigate(['../../my-job-offers'], {relativeTo: this.route});

                    }
                }
            })
    }

}
