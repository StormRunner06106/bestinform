import {Component, HostListener, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {LandingService} from "../../features/landing-bestinform/landing-service.service";
import {BehaviorSubject, first, Subscription} from "rxjs";
import {ToastService} from "../../shared/_services/toast.service";
import {Locations} from "../../shared/locations";
import {ActivatedRoute, Router} from "@angular/router";
declare let dataLayer: any;

enum LangOptions {
    RO,
    EN
}

@Component({
    selector: 'app-landing-form',
    standalone: true,
    imports: [CommonModule, MatLegacyFormFieldModule, MatLegacyInputModule, ReactiveFormsModule, FormsModule],
    templateUrl: './landing-form.component.html',
    styleUrls: ['./landing-form.component.scss'],
    providers: [Locations]
})
export class LandingFormComponent implements OnInit {
    currentStep = 0;
    contentForm: FormGroup;

    pageLang: LangOptions;

    pageTitle = {
        title: [
            'Formular înscriere',
            'Sign up form']
    };

    form = {
        firstStep: {
            title: [
                'Despre tine',
                'About you'
            ],
            content: [
                'Salutare, vrem ca acest proces să fie foarte rapid, așa că o să trecem direct la subiect. Dar, pentru că nu vrem să fim nepoliticoși, mai întâi spune-ne, care este numele tău?',
                'Hello, we want to make this process very quick, so we\'ll get straight to the point. But because we don\'t want to be rude, first tell us, what\'s your name?'
            ],
            field: [
                'Numele tău',
                'Your name'
            ]
        },
        secondStep: {
            title: ['Unde te putem contacta',
                'Where can we contact you?'
            ],
            content: ['Super! Care este adresa ta de email?',
                'Super! What is your e-mail adress?'],
            field: ['Email-ul tău',
                'Your email']
        },
        thirdStep: {
            title: ['Tip locație',
                'Location type'],
            content: ['Ce tip de locație ai?',
                'What type of location do you have?'],
            field: {
                club: ['Club/Petrecere', 'Club/Party'],
                museum: ['Muzeu', 'Museum'],
                sport: ['Sport & Aventură', 'Sport & Adventure'],
                cinema: ['Teatru/Cinema',
                    'Theatre/Cinema'],
                other: ['Alt tip...', 'Other type...']
            }
        },
        fourthStep: {
            title: ['Județ', 'County'],
            content: ['În ce județ este locația ta?', 'What county is your location in?'],
            field: ['Selectează județ', 'Select county']
        },
        fifthStep: {
            title: ['Volum rezervări', 'Booking volume'],
            content: ['Câte rezervări poate accepta simultan locația ta?',
                'How many bookings can your venue take at once?'],
            field: ['Sub 50', 'Under 50']
        },
        sixthStep: {
            title: ['Locația ta este compatibilă',
                'Your location is compatible'],
            content: ['Super! Pe baza răspunsurilor tale, ai o locație compatibilă pentru a fi promovat GRATUIT pe\n' +
            '                Bestinform. Haide să ne auzim!', 'Super! Based on your answers, you have a compatible location to be advertised on Bestinform for FREE. Let\'s hear each other!'],
            field: {
                name: ['Numele tău', 'Your name'],
                location: ['Numele locației', 'Location name'],
                phone: ['Numărul tău de telefon', 'Your phone number'],
                email: ['Email-ul tău', 'Your email']
            }
        }
    };

    errorMsg = {
        requiredMsg: ['Acest câmp trebuie completat!', 'This field is required!'],
        emailMsg: ['Acest email nu este valid!', 'This email is invalid!'],
        phoneMsg: ['Numărul de telefon nu este valid!', 'Phone number is not valid!'],
        bePhone: ['Numărul de telefon introdus există deja!', 'This phone number already exists!'],
        beEmail: ['Emailul introdus există deja!', 'This email already exists!'],
        beGeneral: ['Acțiunea nu a fost finalizată!', 'Action not finished!'],
        beSuccess: ['Acțiune finalizată!', 'Action finished!'],
        emailExists: ['Acest email este deja asociat unui partener!', 'This email is already associated with a partner!']
    };

    buttons = {
        back: ['Înapoi', 'Back'],
        next: ['Înainte', 'Next'],
        finish: ['Finalizează', 'Finish'],
        finishing: ['Finalizare...', 'Finishing...']
    };

    menu = {
        home: ['Acasă', 'Home'],
        char: ['Caracteristici', 'Characteristics'],
        offer: ['Ce oferim', 'What we offer'],
        benefits: ['Beneficii', 'Benefits'],
        join: ['Devino partener', 'Become a partner'],
        start: ['Începe acum', 'Start now'],
        required: ['Completati toate campurile obligatorii!', 'Complete all the required fields!']
    };

    footer = {
        text: ['Orice mare poveste are un început. A ta începe cu Bestinform!',
            'Every great story has a beginning. Yours starts with Bestinform!']
    }


    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];


    constructor(private fb: FormBuilder,
                private landingService: LandingService,
                private toastService: ToastService,
                private locationsTable: Locations,
                private router: Router,
                private route: ActivatedRoute) {
        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);
    }

    counties = this.locationsTable.counties;
    // lastScroll = 0;
    // isSticky = true;

    // @HostListener('window:scroll', ['$event']) onScroll(){
    //     // console.log('scroll', window.scrollY)
    //     if(window.scrollY < 0){
    //         this.isSticky = true;
    //         this.lastScroll = window.scrollY;
    //     }else if(window.scrollY < this.lastScroll){
    //         this.isSticky = true;
    //         this.lastScroll = window.scrollY;
    //         console.log('scroll in sus', this.lastScroll, window.scrollY)
    //
    //     }else if(window.scrollY > this.lastScroll && window.scrollY > 0){
    //         this.isSticky = false;
    //         this.lastScroll = window.scrollY;
    //         console.log('scroll in jos', this.lastScroll, window.scrollY)
    //     }
    // }

    ngOnInit() {
        const currentRoute = this.route.snapshot.url.join('/');
        if (currentRoute.includes('ro')) {
            this.pageLang = LangOptions.RO;
        } else if (currentRoute.includes('en')) {
            this.pageLang = LangOptions.EN;
        } else {
            void this.router.navigate(['/parteneri/formular/ro']);
        }

        this.initForm();
    }

    changeStep(stepNumber: number) {
        if(stepNumber < this.currentStep){
            this.currentStep = stepNumber;
        }else{
            if (stepNumber === 5) {
                this.contentForm.get('lastForm.email').patchValue(this.contentForm.get('initEmail').value);
                this.contentForm.get('lastForm.name').patchValue(this.contentForm.get('initName').value);

            }
            if (this.currentStep === 0) {
                this.contentForm.get('initName').markAsTouched();
                if (this.contentForm.get('initName').valid) {
                    dataLayer.push({
                        'event': 'registration_step',
                        'step': this.currentStep + 1,
                        'step_label': 'Despre tine',
                    });
                    this.currentStep = stepNumber;
                } else {
                    return;
                }
            } else if (this.currentStep === 1) {
                this.contentForm.get('initEmail').markAsTouched();
                if (this.contentForm.get('initEmail').valid) {
                    dataLayer.push({
                        'event': 'registration_step',
                        'step': this.currentStep + 1,
                        'step_label': 'Unde te putem contacta',
                    });

                    const firstForm = {
                        name: this.contentForm.value.initName,
                        email: this.contentForm.value.initEmail
                    };

                    this.landingService.createLandingContact(firstForm).subscribe({
                        next: (respCreate: { success: boolean, reason: string }) => {
                            if (respCreate.success) {
                                // console.log('create', respCreate);
                                this.currentStep = stepNumber;
                            }
                        },
                        error: error => {
                            if(error?.error?.reason === 'emailExists'){
                                this.toastService.showToast('Error', this.errorMsg.emailExists[this.pageLang], 'error', true);
                            }else{
                                this.toastService.showToast('Error', this.errorMsg.beGeneral[this.pageLang], 'error', true);
                            }

                            this.initForm();
                            this.currentStep = 0;
                        }
                    });
                } else {
                    return;
                }
            } else if (this.currentStep === 2 || this.currentStep === 3 || this.currentStep === 4) {
                if (this.currentStep === 2) {
                    if (stepNumber === 3) {
                        console.log('form', this.contentForm.value);
                        dataLayer.push({
                            'event': 'registration_step',
                            'step': this.currentStep + 1,
                            'step_label': 'Tip locație',
                            'step_selected_option': this.contentForm.value.locationType.locationType,
                            'location_type': this.contentForm.value.locationType.locationType,
                        });

                    }
                }

                if (this.currentStep === 3) {
                    if (stepNumber === 4) {
                        console.log('form', this.contentForm.value);
                        dataLayer.push({
                            'event': 'registration_step',
                            'step': this.currentStep + 1,
                            'step_label': 'Judeţ',
                            'step_selected_option': this.contentForm.value.county,
                            'location_type': this.contentForm.value.locationType.locationType,
                            'county': this.contentForm.value.county,
                        });
                    }
                }

                if (this.currentStep === 4) {
                    if (stepNumber === 5) {
                        dataLayer.push({
                            'event': 'registration_step',
                            'step': this.currentStep + 1,
                            'step_label': 'Volum rezervări',
                            'step_selected_option': this.contentForm.value.salesVolume.salesVolume,
                            'location_type': this.contentForm.value.locationType.locationType,
                            'county': this.contentForm.value.county,
                            'booking_volume': this.contentForm.value.salesVolume.salesVolume
                        });
                    }
                }
                this.currentStep = stepNumber;
            } else if (this.currentStep === 5) {
                this.contentForm.get('lastForm').markAllAsTouched();
                if (this.contentForm.get('lastForm').valid) {
                    this.currentStep = stepNumber;
                }
            }
        }

    }

    initForm() {
        this.contentForm = this.fb.group({
            initName: ['', Validators.required],
            initEmail: ['', [Validators.required, Validators.email]],
            county: [''],
            locationType: this.fb.group({
                locationType: ['Restaurant']
            }),
            salesVolume: this.fb.group({
                salesVolume: ['Sub 50']
            }),
            lastForm: this.fb.group({
                name: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                locationName: [''],
                telephone: ['', [Validators.required, Validators.pattern('^(?:\\+4\\d{10}|4\\d{10}|0\\d{9})$')]],
            })

        });
    }



    sendForm() {
        this.isSubmitLoading = true;

        this.contentForm.markAllAsTouched();
        if (this.contentForm.valid) {
            const secondForm = {
                ...this.contentForm.get('lastForm').value,
                initEmail: this.contentForm.value.initEmail,
                county: this.contentForm.value.county,
                locationType: this.contentForm.get('locationType.locationType').value,
                salesVolume: this.contentForm.get('salesVolume.salesVolume').value
            }

            this.landingService.updateLandingSubscription(secondForm).subscribe({
                next: (respUpdate: { success: boolean, reason: string }) => {
                    // console.log('update', respUpdate);
                    if (respUpdate.success) {
                        // Execute the dataLayer.push() function
                        dataLayer.push({
                            'event': 'form_submitted',
                            'form_name': 'Landing Parteneri',
                            'form_id': '1',
                            'location_type': this.contentForm.get('locationType.locationType').value,
                            'county': this.contentForm.value.county,
                            'booking_volume': this.contentForm.get('salesVolume.salesVolume').value
                        });

                        this.isSubmitLoading$.next(false);
                        this.toastService.showToast('Success', this.errorMsg.beSuccess[this.pageLang], 'success');
                        this.router.navigate(['/parteneri/formular/success/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en')]);

                    }
                },
                error: error => {
                    if (error.error?.reason === 'invalid_parameter') {
                        this.isSubmitLoading$.next(false);
                        this.toastService.showToast('Error', this.errorMsg.beEmail[this.pageLang], 'error', true);
                    } else if (error.error?.reason === 'duplicate_parameter') {
                        this.isSubmitLoading$.next(false);
                        this.toastService.showToast('Error', this.errorMsg.bePhone[this.pageLang], 'error', true);
                    } else {
                        this.isSubmitLoading$.next(false);
                        this.toastService.showToast('Error', this.errorMsg.beGeneral[this.pageLang], 'error', true);
                    }
                }
            });

            // console.log('second form', secondForm);
        } else {
            this.isSubmitLoading$.next(false);
            this.toastService.showToast('Error', this.errorMsg.requiredMsg[this.pageLang], 'error', true);
            // console.log('not valid');
        }
    }

    changeRoute() {
        void this.router.navigate(['/parteneri/formular/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en')]);
    }

    goToHome() {
        this.router.navigate(['/parteneri/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en')]);
    }

    get LangOptions() {
        return LangOptions;
    }

    scroll(el: HTMLElement) {
        el.scrollIntoView();
    }

}
