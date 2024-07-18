/* eslint-disable no-prototype-builtins */
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {DeviceDetectorService} from "ngx-device-detector";
import {TranslateService} from "@ngx-translate/core";
declare let dataLayer: any;

@Component({
    selector: 'app-homepage-giveaway',
    templateUrl: './homepage-giveaway.component.html',
    styleUrls: ['./homepage-giveaway.component.scss'],
    // providers: [MatDialog ,  { provide: MAT_DIALOG_DATA, useValue: {} }, ]
})
export class HomepageGiveawayComponent {

    // public settings: Settings;
    firstName: string;
    lastName: string; // Added lastName property
    email: string;
    password: string;
    confirmPassword: string; // Added confirmPassword property
    termsConditions: boolean;

    responseMessage: string;
    errorMessage: string;

    private showPopUp = false;
    public isDekstop = true;
    public registrtationSuccesful = "assets/images/login/registration_successful.png";

    // Inject HttpClient into your component
    constructor(private http: HttpClient,
                private deviceDetector: DeviceDetectorService,
                private translateService: TranslateService,
                private router: Router,) {
        this.isDekstop = this.deviceDetector.isDesktop();
        if (!this.isDekstop) this.registrtationSuccesful = "assets/images/login/registration_successful_mobile.png";
        this.translateService.onLangChange.subscribe((res) => {
            if (res.lang === "ro") {
                if (this.isDekstop) {
                    this.registrtationSuccesful = "assets/images/login/registration_successful.png";
                } else {
                    this.registrtationSuccesful = "assets/images/login/registration_successful_mobile.png";
                }
            }
            if (res.lang === "en") {
                if (this.isDekstop) {
                    this.registrtationSuccesful = "assets/images/login/registration_successful_en.png";
                } else {
                    this.registrtationSuccesful = "assets/images/login/registration_successful_mobile_en.png";
                }
            }
        })

    }

    onSubmit() {
        // Create the data payload in the structure expected by your backend
        const payload = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            nickname: "",
            roles: ["ROLE_CLIENT"],
            gender: "",
            city: "",
            county: "",
            telephone: "",
            birthdate: "2024-02-02",
            avatar: {
                fileName: "",
                filePath: "",
            },
            domain: "",
            companyName: "",
            description: "",
            percentageCommission: 0,
            j: "",
            fax: "",
            billingAddress: {
                name: "",
                address: "",
                city: "",
                county: "",
                country: "",
                postcode: "",
                iban: "",
                bankName: "",
            },
            currentGeographicalCoordinates: {
                longitude: 0,
                latitude: 0,
            },
            preferences: [
                {
                    attributeId: "",
                    attributeValues: [
                        {
                            attributeValue: "",
                            score: 0,
                        },
                    ],
                },
            ],
            cui: "",
            agentName: "",
            providerStatus: "",
        };

        interface RegisterResponse {
            success?: boolean;
            reason?: string;
            // Include other properties that the response might have
        }


        // Make the HTTP POST request
        this.http.post(`${environment.api_url}/bestinform/registerUser`, payload, { observe: 'response' })
            .subscribe(
                (response) => {
                    if (response.status === 201) { // 201 is the HTTP status code for "Created"
                        const formName = 'Formular_Giveaway';
                        const formId = `form-${Date.now()}`;
                        dataLayer.push({
                            'event': 'form_submitted',
                            'form_name': formName,
                            'form_id': formId
                        });
                        const userId = (response.body as RegisterResponse).reason;
                        const url = `${environment.api_url}/bestinform/sendRegistrationEmail?userId=` + userId;
                        this.http.get(url).subscribe(response => {
                            console.log('Email sent successfully');
                        }, error => {
                            console.error('Error sending email', error);
                        });
                        this.showPopUp = true;
                    } else {
                        // If the response includes a message, log it or display it to the user
                        const message = 'An unexpected error occurred.';
                        console.log('Received response with status: ', response.status, 'Message:', message);
                        // TODO: Display this message in the UI
                        // For example, you might set it to a component property or use a service to display a toast
                        this.responseMessage = message; // Assuming you have a property called 'responseMessage' in your component
                    }
                },
                (error) => {
                    console.error('Error', error);
                    const errorMessage = error.error?.reason || 'Failed to register. Please try again later.';
                    // TODO: Display this error message in the UI
                    // You might use a modal, toast, or set an error property in your component
                    this.errorMessage = errorMessage; // Assuming you have a property called 'errorMessage' in your component
                }
            );
    }

    get passwordsDoNotMatch(): boolean {
        // This will now be a computed property that updates every time the inputs change
        return this.confirmPassword && this.password !== this.confirmPassword;
    }

    closePopUp() {
        this.showPopUp = false;
    }
}

