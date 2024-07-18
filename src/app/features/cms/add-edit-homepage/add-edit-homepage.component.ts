import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {forkJoin, of, Subject, switchMap, takeUntil} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Homepage} from "../../../shared/_models/homepage.model";
import {HomepageService} from "../../../shared/_services/homepage.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-add-edit-old-homepage',
    templateUrl: './add-edit-homepage.component.html',
    styleUrls: ['./add-edit-homepage.component.scss'],
    providers: [ModalMediaService]
})
export class AddEditHomepageComponent implements OnInit {

    private ngUnsubscribe = new Subject<void>();

    isEditMode: boolean;

    homepageData: Homepage;
    homepageForm: FormGroup;
    submitBtnClicked = false;
    arrForm: FormArray;

    imageFiles = [];

    constructor(private fb: FormBuilder,
                private homepageService: HomepageService,
                private route: ActivatedRoute,
                private toastService: ToastService,
                private cdr: ChangeDetectorRef,
                private modalMediaService: ModalMediaService,
                private modalService: NgbModal
    ) {
    }

    ngOnInit(): void {
        this.initFormGroup();
        this.getHomepageData();
        this.getImagesFromMedia();
    }

    initFormGroup() {
        this.homepageForm = this.fb.group({

            id: [''],

            language: ['ro'],
            app: ['web'],

            hero: this.fb.group({
                title: ['', Validators.required],
                contentText: ['', Validators.required],
                backgroundImage: [{
                    fileName: '',
                    filePath: ''
                }],
                buttonText: ['', Validators.required]
            }),

            benefits: this.fb.array([]),

            trialSection: this.fb.group({
                mainTitle: ['', Validators.required],
                subTitle: ['', Validators.required],
                content: ['', Validators.required],
                buttonText: ['', Validators.required],
                image: [{
                    fileName: '',
                    filePath: ''
                }]
            }),

            gallery: this.fb.group({
                textContent: ['', Validators.required],
                videos: this.fb.array([])
            }),

            callToAction: this.fb.group({
                title: ['', Validators.required],
                content: ['', Validators.required],
                buttonText: ['', Validators.required]
            })

        });
    }

    get benefits() {
        return this.homepageForm.get('benefits') as FormArray;
    }

    get videos() {
        return this.homepageForm.get('gallery.videos') as FormArray;
    }

    get trialSectionC() {
        return this.homepageForm.get('trialSection') as FormArray;
    }

    customResetForm() {
        const langToKeep = this.homepageForm.value.language;
        const appToKeep = this.homepageForm.value.app;
        this.homepageForm.reset();
        this.benefits.clear();
        this.videos.clear();
        this.homepageForm.controls.language.setValue(langToKeep);
        this.homepageForm.controls.app.setValue(appToKeep);

    }

    getHomepageData() {

        this.customResetForm();

        this.homepageService.getHomepageByLanguageAndApp(this.homepageForm.value.language, this.homepageForm.value.app)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((homepage: Homepage) => {
                this.isEditMode = true;
                this.homepageData = homepage;
                this.homepageForm.patchValue(this.homepageData);
                console.log('la get', homepage);
                // console.log('la get',this.homepageForm.get('gallery').value);


                if (this.homepageData.benefits) {
                    this.homepageData.benefits.forEach(benefit => {
                        this.benefits.push(
                            this.fb.group({
                                title: [benefit.title, Validators.required],
                                content: [benefit.content, Validators.required]
                            })
                        );
                    });
                }

                if (this.homepageData.gallery?.videos) {
                    this.homepageData.gallery.videos.forEach(video => {
                        this.videos.push(
                            this.fb.group({
                                fileName: [video.fileName, Validators.required],
                                filePath: [video.filePath, Validators.required],
                                featuredImagePath: [video.featuredImagePath]
                            })
                        );
                    });
                }
            });
    }

    submitHomepage() {
        this.homepageForm.markAllAsTouched();

        this.submitBtnClicked = true;

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })

        if (this.homepageForm.valid) {

            this.homepageService.updateHomepage(this.homepageData.id, this.homepageForm.value).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    if (this.imageFiles.length > 0) {
                        const imageRequests$ = [];

                        this.imageFiles.forEach(imageFile => {
                            const formData = new FormData();
                            formData.append("file", imageFile.imageFile);

                            imageRequests$.push(this.homepageService.uploadHomepageImage(this.homepageData.id, imageFile.imageType, formData));
                        });

                        // forkJoin(...imageRequests$).subscribe(() => {
                        //     this.toastService.showToast('Succes', 'Homepage modificat cu succes', 'success');
                        // }, () => {
                        //     this.toastService.showToast('Eroare', 'Homepage modificat, eroare la incarcarea imaginilor', 'error');
                        // });

                        forkJoin(...imageRequests$).subscribe({
                            next: () => {
                            this.toastService.showToast('Succes', 'Homepage modificat cu succes', 'success');

                            }, 

                            error: err => {
                                this.toastService.showToast('Eroare', 'Homepage modificat, eroare la incarcarea imaginilor', 'error');

                            }
                        });

                    } else {
                        this.toastService.showToast('Succes', 'Homepage modificat cu succes', 'success');

                    }
                } else {
                    this.toastService.showToast('Eroare', 'Eroare de la server', 'error');

                }
            }, () => {
                this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
            });

        } else {
            this.toastService.showToast('Eroare', 'Completati campurile obligatorii', 'error');
        }
    }

    clearFormControl(formControl) {
        this.homepageForm.get(formControl).patchValue('');
    }

    // onImageChange(event, formControl, imageType) {
    //     if (event.target.files && event.target.files[0]) {
    //
    //         const reader = new FileReader();
    //         reader.onload = () => this.homepageForm.get(formControl).patchValue({
    //             fileName: '',
    //             filePath: reader.result
    //         });
    //         reader.readAsDataURL(event.target.files[0]);
    //
    //         this.imageFiles.push({
    //             imageType: imageType,
    //             imageFile: event.target.files[0]
    //         });
    //     }
    // }

    openMedia(content: any) {
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    removeImage(formControl, imageType) {
        this.homepageForm.get(formControl).patchValue({fileName: '', filePath: ''});

        // parcurgem arrayul si stergem fisierul daca exista
        if (this.imageFiles.length > 0) {
            this.imageFiles.forEach((file, index) => {
                if (file.imageType === imageType) {
                    this.imageFiles.splice(index, 1);
                }
            });
        }

        // daca suntem pe edit, stergem si din homepageData imaginea
        if (this.isEditMode) {
            if (imageType === 'background') {
                this.homepageData.hero.backgroundImage = null;
            } else if (imageType === 'trial') {
                this.homepageData.trialSection.image = null;
            }
        }
    }

    getImagesFromMedia() {
        this.modalMediaService.currentImagesArray
            .subscribe(async (array: any) => {
                if (array.length > 0) {
                    if (array[0].for === 'hero') {
                        this.homepageForm.get('hero.backgroundImage').patchValue(array[0].selectedMedia);
                    } else if (array[0].for === 'trial') {
                        this.homepageForm.get('trialSection.image').patchValue(array[0].selectedMedia);
                    } else if (array[0].for.startsWith('featuredImage')) {
                        const indexToChange = (array[0].for).split('-')[1];
                        this.videos.at(indexToChange).patchValue({featuredImagePath: array[0].selectedMedia.filePath});
                        this.cdr.detectChanges();
                    }else if(array[0].for.startsWith('video')){
                        const indexToChange = (array[0].for).split('-')[1];
                        this.videos.at(indexToChange).patchValue({filePath: array[0].selectedMedia.filePath});
                        this.cdr.detectChanges();
                    }
                }
            });
    }


    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}


