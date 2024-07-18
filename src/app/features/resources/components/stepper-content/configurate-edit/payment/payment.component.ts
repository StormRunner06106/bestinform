import {Component, OnDestroy, OnInit} from '@angular/core';
import {StepperService} from "../../../../_services/stepper.service";
import {FormArray, FormGroup} from "@angular/forms";
import {ResourcesService} from "../../../../_services/resources.service";
import {RentalBookingService} from "../../../../_services/rental-booking.service";
import {BehaviorSubject, forkJoin, Observable, of, Subscription, switchMap} from "rxjs";
import {ToastService} from "../../../../../../shared/_services/toast.service";
import {Router} from "@angular/router";
import {UserDataService} from "../../../../../../shared/_services/userData.service";
import {TicketsBookingService} from "../../../../_services/tickets-booking.service";
import {TimepickerService} from "../../../../_services/timepicker.service";
import {ProductListService} from "../../../../_services/product-list.service";
import {BookingTimeslotsService} from "../../../../_services/booking-timeslots.service";
import {CreateResourceService} from "../../../../../../shared/_services/createResource.service";
import {MenuService} from "../../../../_services/menu.service";
import {User} from "../../../../../../shared/_models/user.model";
import {CulturalBookingService} from "../../../../_services/cultural-booking.service";
import moment from "moment";

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {

    isStaff: boolean;
    isAdmin: boolean;
    isProvider: boolean;

    currentResourceId: string;
    roomsArray: any;
    currentBookingType: string;


    commission = 0;
    userId: string;

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];

    constructor(private resourceService: ResourcesService,
                private stepperService: StepperService,
                private roomService: RentalBookingService,
                private ticketService: TicketsBookingService,
                private toastService: ToastService,
                private router: Router,
                private userService: UserDataService,
                private timepickerService: TimepickerService,
                private productService: ProductListService,
                private timeslotService: BookingTimeslotsService,
                private createResourceService: CreateResourceService,
                private menuService: MenuService,
                private culturalBookingService: CulturalBookingService) {

        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);

    }

    $fileObservables: Observable<object>[] = [];

    ngOnInit() {

        this.roomsArray = this.roomService.roomList$.getValue();

        this.userService.getCurrentUser().subscribe((response: any) => {
            this.userId = response.id;
            if (response.roles.includes('ROLE_PROVIDER')) {
                this.isProvider = true;
                this.commission = response?.percentageCommission;
            }

            if (response.roles.includes('ROLE_STAFF')) {
                this.isStaff = true;
                this.getCommission();
            }

            if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                this.isAdmin = true;
                this.getCommission();
            }
        })

        if (this.resourceService.resourceId$.getValue()) {
            this.currentResourceId = this.resourceService.resourceId$.getValue();
        }

        this.currentBookingType = this.resourceService.resourceTemplateData$.getValue().bookingType;

    }


    getCommission() {
        if (this.isStaff || this.isAdmin) {
            if (this.createResourceService.providerData$.getValue()) {
                const providerId = this.createResourceService.providerData$.getValue().providerId;
                console.log('prov id', providerId);
                this.userService.getUserById(providerId).subscribe({
                    next: (provider: User) => {
                        this.commission = provider?.percentageCommission;
                    }
                })
            }

        }
    }

    getRandomId() {
        return Math.floor((Math.random()*6)+1);
    }

    transformMenu(inputMenus) {
        return inputMenus.map(menu => ({
            categoryName: menu.categoryName,
            items: menu.subCategories.flatMap(subCategory =>
                subCategory.subCategoryItems.map(item => ({
                    name: item.name,
                    description: item.ingredients,
                    price: parseFloat(item.price),
                    dietaryPreferences: [item.nutritionalFacts],
                    // imageUrl: item?.imageUrl[0] ? item?.imageUrl[0] : ''
                }))
            )
        }));
    }

    calculateAveragePrice(menuCategories): number {
        let totalSum = 0;
        let itemCount = 0;
    
        menuCategories.forEach(category => {
            category.items.forEach(item => {
                totalSum += item.price;
                itemCount++;
            });
        });
    
        return itemCount > 0 ? totalSum / itemCount : 0;
    }

    extractTrueFields(locationInfo): string[] {
        return Object.keys(locationInfo).filter(key => locationInfo[key] === "true");
    }

    extractAndRebuildTagsInfo(tags): string[] {
        const replacements = {
            "Free Wi-Fi": "WIFI",
            "Pet-friendly": "PET_FRIENDLY"
        };

        return Object.keys(tags)
            .filter(key => tags[key] === "true")
            .map(key => replacements[key] || key);
    }

    extractAndRebuildFacilityInfo(info):string[] {
        const replacements = {
            "Free Wi-Fi": "WIFI",
            "Pet-friendly": "PET_FRIENDLY"
        };

        return Object.keys(info)
            .filter(key => info[key] === "true")
            .map(key => replacements[key] || key);
    }

    extractAndRebuildEntertainmentInfo(entertainmentString) :string {
        const replacements = {
            "Live music": "LIVE_MUSIC",
            "Jazz bar": "JAZZ_BAR",
            "Live DJ": "LIVE_DJ",
            "Karaoke": "KARAOKE",
            "Blues bar": "BLUES_BAR",
            "Stand up": "STAND_UP",
            "Dancers show": "DANCERS_SHOW",
            "Magic show": "MAGIC_SHOW",
            "Cabaret": "CABARET",
            "Books available": "BOOKS",
            "Playground": "PLAYGROUND",
            "Local traditions": "TRADITIONS"
        };

        // Split the string by commas, trim whitespace, and map to replacements
        return entertainmentString.split(',')
            .map(item => item.trim())
            .filter(item => replacements[item])
            .map(item => replacements[item]);
    }

    extractAndRebuildRangePriceInfo(price): string {
        const replacements = {
            "Low cost": "$",
            "Free": "$",
            "Mid-range cost": "$$",
            "High cost": "$$$"
        };

        // Replace occurrences of keys in the price string with their corresponding values
        for (const key in replacements) {
            if (Object.prototype.hasOwnProperty.call(replacements, key)) {
                price = price.replace(key, replacements[key]);
            }
        }

        return price;
    }

    extractAndRebuildLanguageInfo(languagesArray: string[]): string[] {
        const replacements = {
            "English": "EN",
            "Spanish": "SP",
            "Polish": "PL",
            "Romanian": "RO"
        };
        const enumArray = [];

        // Iterate over each language in the array
        for (let i = 0; i < languagesArray.length; i++) {
            const lang = languagesArray[i];

            // Check if the language exists in the replacements object
            if (Object.prototype.hasOwnProperty.call(replacements, lang)) {
                // Push the corresponding enum value to the enumArray
                enumArray.push(replacements[lang]);
            } else {
                // If the language is not found in replacements, you can choose to handle this case as needed
                // For example, you can push a default value or handle it differently
                console.error(`No enum value found for language: ${lang}`);
            }
        }

        return enumArray;
    }

    calculateTotalPeople(schedule): number {
        let total = 0;
        schedule.forEach(day => {
            total += day.maximumPeople;
        });
        return total;
    }

    generateModificationPolicy(policyObject): string {
        let modificationPolicy: string;
    
        if (policyObject.freeCancellation?.freeCancellation) {
            modificationPolicy = `Free cancellation up to ${policyObject.freeCancellation.deadlineDays} days before`;
        }
    
        if (policyObject.nonRefundable) {
            modificationPolicy = "Non-refundable" ;
        }
    
        if (policyObject.modifiable) {
            modificationPolicy = "Modifiable" ;
        }
    
        return modificationPolicy;
    }

    generateReservationPolicy(policyObject) :string {
        let reservationPolicy: string;

        if(policyObject.depositRequired){
            reservationPolicy = `Deposit required`;
            if(policyObject.depositRequiredAmount){
                reservationPolicy = `Deposit amount: ${policyObject.depositRequiredAmount}`;
            }
        }

        return reservationPolicy;
    }
    
    

    submitForm(){
        this.isSubmitLoading$.next(true);

        // TODO: reservation policy? check array or string
        // TODO: do we need services?

        const combineForms: any = new FormGroup({
            ...this.resourceService.generalInformationForm$.getValue().controls,
            ...this.resourceService.facilitiesForm$.getValue().controls,
            ...this.resourceService.filesForm$.getValue().controls,
            ...this.resourceService.publicTransportForm.controls,
            ...this.resourceService.nearByForm.controls,
            ...this.resourceService.airportsForm.controls,
            ...this.resourceService.attractionsForm.controls,
        })

        this.getTransportationFormValues(combineForms);

        const menu = this.transformMenu(this.menuService.menuList$.getValue());
        const avgPrice = this.resourceService.avgPriceForm.controls.avgPriceControl.value;
        const tags = this.extractAndRebuildTagsInfo(combineForms.value);
        const facilities = this.extractAndRebuildFacilityInfo(this.resourceService.facilitiesForm$.getValue().value);
        const maximumPeople = this.calculateTotalPeople(this.timepickerService.availability$.getValue());
        let paymentOptions = [];
        const paymentValue = combineForms.get('Payment').value;
        
        if (typeof paymentValue === 'string' && paymentValue !== "") {
            // It's a non-empty string, so split it
            paymentOptions = paymentValue.split(',');
        } else if (Array.isArray(paymentValue)) {
            // It's already an array, so use it directly
            paymentOptions = paymentValue;
        } else {
            // Handle other cases, such as when paymentValue is empty or undefined
            paymentOptions = [];
        }


        const changePolicies = this.timepickerService.changePolicies$.getValue();
        const policies = this.timepickerService.bookingPolicies$.getValue();

        const wineSelection = combineForms.get('Wine selection')?.value.length > 0 ? combineForms.get('Wine selection')?.value : [];

        // Construct the body
        const body = {
            id: combineForms.get("id") ? combineForms.get("id").value : null,
            name: combineForms.get('title').value,
            address: combineForms.get('address').value,
            city: combineForms.get('city').value,
            country: combineForms.get('country').value,
            description: combineForms.get('description').value,
            location: {
                type: "Point",
                coordinates: [combineForms.get('longitude').value, combineForms.get('latitude').value]
            },
            specific: combineForms.get('specific').value,
            modificationPolicy: this.generateModificationPolicy(changePolicies),
            reservationPolicy: this.generateReservationPolicy(policies),
            modificationPolicyData: changePolicies,
            reservationPolicyData: policies,
            availablePlaces: maximumPeople,
            about: {
                story: combineForms.get('Our Story')?.value,
                entertainment: combineForms.get('Entertainment')?.value.length > 0 ? this.extractAndRebuildEntertainmentInfo(combineForms.get('Entertainment')?.value) : [],
                wineSelection: wineSelection,
                michelinStars: combineForms.get("Michelin ⭐ ")?.value.length > 0 ? parseInt(combineForms.get("Michelin ⭐ ")?.value) : "",
                athmosphere: combineForms.get('Atmosphere')?.value.length > 0 ? combineForms.get('Atmosphere')?.value.join(",") : "",
                goodFor: combineForms.get('Good for')?.value.length > 0 ? combineForms.get('Good for')?.value : [],
                wheelchairAccessibility: combineForms.get(" Wheelchairs accesibility")?.value.length > 0 ? combineForms.get(" Wheelchairs accesibility")?.value.join(",") : "",
                diningOptions: combineForms.get('Dining options')?.value ? combineForms.get('Dining options')?.value : [],
                parkingOptions: combineForms.get('Parking options')?.value ? combineForms.get('Parking options')?.value : [],
                // publicTransportation: combineForms.get('Public transportation')?.value ? [combineForms.get('Public transportation')?.value] : [],
                payment: combineForms.get('Payment')?.value ? combineForms.get('Payment')?.value : [],
                languagesSpoken: combineForms.get('Languages spoken')?.value.length > 0 ? this.extractAndRebuildLanguageInfo(combineForms.get('Languages spoken')?.value) : [],
                locationTheme:combineForms.get('Location theme')?.value ? combineForms.get('Location theme')?.value : "",
                additionalInfo: combineForms.get('Additional info')?.value.length > 0 ? combineForms.get('Additional info')?.value.join(",") : "",
                range:combineForms.get('Range')?.value ? this.extractAndRebuildRangePriceInfo(combineForms.get('Range')?.value) : "$",
                // airportDistance:combineForms.get('Airport distance')?.value ? combineForms.get('Airport distance')?.value : "",
                // nearBy: combineForms.get("What's nearby")?.value ? combineForms.get("What's nearby")?.value : ""
                airportDistance: this.getAirportFormValues(combineForms),
                publicTransportation: this.getTransportationFormValues(combineForms),
                nearBy: this.getNearByFormValues(combineForms),
                principalAttractions: this.getAttractionFormValues(combineForms),
            },
            phoneNumber: combineForms.get('Telephone')?.value ? combineForms.get('Telephone').value : '',
            email: combineForms.get('Email')?.value ? combineForms.get('Email').value : '',
            featuredImage: combineForms.get('thumbnail').value ? combineForms.get('thumbnail').value : "",
            resourceTypeId: this.resourceService.resourceTemplateType$.getValue().resourceTypeId,
            categoryId: this.resourceService.resourceTemplateType$.getValue().categoryId,
            images: combineForms.get("images").value,
            currency: combineForms.get('currency')?.value ? combineForms.get('currency').value : '',
            timetable: this.timepickerService.availability$.getValue(),
            facilitiesList: facilities,
            rating: 0,
            views: 0,
            reviews: [],
            paymentOptions: paymentOptions,
            tags: tags,
            menus: menu,
            avgPrice: avgPrice != null ? avgPrice : 0.0,
            services: this.resourceService.services$.getValue() ? this.resourceService.services$.getValue() : [],
            orderDismissTime: this.resourceService.orderInfo$.getValue() ? this.resourceService.orderInfo$.getValue() : '',
            videoUrl: ""
        }

        const hasVideo = combineForms.get('videos')?.value?.length > 0;
        const hasImages = combineForms.get('imagesFiles')?.value?.length > 0;
        const hasThumbnail = combineForms.get('thumbnailFile').value?.length > 0;

        const uploads = [];
        if (hasThumbnail && combineForms.get('thumbnailFile').value?.length > 0) {
            uploads.push(this.resourceService.createImagesOnServer(combineForms.get('thumbnailFile').value));
        }
        if (hasImages && combineForms.get('imagesFiles').value?.length > 0) {
            uploads.push(this.resourceService.createImagesOnServer(combineForms.get('imagesFiles').value));
        }
        if (hasVideo) {
            uploads.push(this.resourceService.createImagesOnServer(combineForms.get('videos').value));
        }

        forkJoin(uploads.length > 0 ? uploads : of([])).pipe(
            switchMap(results => {
                if (hasThumbnail) {
                    body.featuredImage = results.shift()[0];
                }
                if (hasImages) {
                    const galleryLinks = results.shift();
                    galleryLinks?.forEach(link => body.images.push(link));
                }
                if (hasVideo) {
                    body.videoUrl = results.shift()[0];
                }

                // Finally, make the call to add the restaurant
                return this.resourceService.addRestaurant(body, this.userId);
            })
        ).subscribe({
            next: (response) => {
                console.log('Response', response);
                setTimeout(() => {
                    if (this.isProvider) {
                        this.isSubmitLoading$.next(false);
                        this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                    } else if (this.isStaff) {
                        this.isSubmitLoading$.next(false);
                        this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                    } else if (this.isAdmin) {
                        this.isSubmitLoading$.next(false);
                        this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                    }
                }, 3000);
            },
            error: (error) => {
                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
            }
        });
        const transportsArray = this.resourceService.publicTransportForm.get('transports') as FormArray;
        const nearByArray = this.resourceService.nearByForm.get('nearBy') as FormArray;
        const attractionsArray = this.resourceService.attractionsForm.get('attractions') as FormArray;
        const airportsArray = this.resourceService.airportsForm.get('airports') as FormArray;
        transportsArray.clear();
        nearByArray.clear();
        attractionsArray.clear();
        airportsArray.clear();
    }

    private getNearByFormValues(combineForms: any): string {
        const transportsArray = combineForms.get('nearBy') as FormArray;
        const items: { name: string, distance: string, icon: string }[] = [];

        for (let i = 0; i < transportsArray.length; i++) {
            const transportGroup = transportsArray.at(i) as FormGroup;

            const location = transportGroup.get('location').value;
            const distanceTo = transportGroup.get('distanceTo').value;

            items.push({
                name: location,
                distance: distanceTo,
                icon: "pi pi-map-marker"
            });
        }

        const result = { items };
        return JSON.stringify(result);
    }


    getAttractionFormValues(combineForms: any): string {
        const attractionsArray = combineForms.get('attractions') as FormArray;
        const items: { name: string, distance: string }[] = [];

        for (let i = 0; i < attractionsArray.length; i++) {
            const attractionGroup = attractionsArray.at(i) as FormGroup;

            const attractionName = attractionGroup.get('attractionName').value;
            const distanceTo = attractionGroup.get('distanceTo').value;

            items.push({
                name: attractionName,
                distance: distanceTo,
            });
        }

        const result = { items };
        return JSON.stringify(result);
    }

    getAirportFormValues(combineForms: any): string {
        const airportsArray = combineForms.get('airports') as FormArray;
        const items: { name: string, distance: string }[] = [];

        for (let i = 0; i < airportsArray.length; i++) {
            const airportGroup = airportsArray.at(i) as FormGroup;

            const airportName = airportGroup.get('airportName').value;
            const distanceTo = airportGroup.get('distanceTo').value;

            items.push({
                name: airportName,
                distance: distanceTo,
            });
        }

        const result = { items };
        return JSON.stringify(result);
    }

    private getTransportationFormValues(combineForms: any): string[] {
        const transportsArray = combineForms.get('transports') as FormArray;
        const publicTransportation: string[] = [];

        for (let i = 0; i < transportsArray.length; i++) {
            const transportGroup = transportsArray.at(i) as FormGroup;

            const transportType = transportGroup.get('transportType').value;
            const stationName = transportGroup.get('stationName').value;
            const distanceTo = transportGroup.get('distanceTo').value;

            const transportObject = {
                transportType: transportType,
                stationName: stationName,
                distanceTo: distanceTo
            };

            const transportString = JSON.stringify(transportObject);
            publicTransportation.push(transportString);
        }

        return publicTransportation;
    }

    /** Go to next step*/
    nextStep() {
        this.isSubmitLoading$.next(true);

        console.log('LAST STEP');

        // // Mark as touched
        // this.form.markAllAsTouched()
        //
        // // Check form validation
        // if (this.form.invalid) {
        //     return
        // }


        const combineForms: any = new FormGroup({
            ...this.resourceService.generalInformationForm$.getValue().controls,
            ...this.resourceService.facilitiesForm$.getValue().controls,
            ...this.resourceService.filesForm$.getValue().controls
        })

        console.log('Form-uri combinate', combineForms.value)
        console.log('Form-uri combinate 2', this.resourceService.resourceTemplateData$.getValue());
        console.log('Form-uri combinate 3', this.resourceService.resourceTemplateType$.getValue());


        // Empty array
        const formData = [];

        // Sort form inputs by tabName
        for (const control in combineForms.controls) {
            this.resourceService.attributesFromResourceTemplate$.getValue().forEach((section) => {
                section.tabAttributes.forEach(attribute => {
                    if (attribute.name === control) {
                        if(attribute.valueType === 'multiple-select'){
                            console.log('ATTR SENT',attribute, combineForms.get(control).value)
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: Array.isArray(combineForms.get(control).value) ? combineForms.get(control).value.join() : combineForms.get(control).value ,
                                attributeIconPath: attribute.icon.filePath
                            });
                        }else{
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: combineForms.get(control).value,
                                attributeIconPath: attribute.icon.filePath
                            });
                        }

                    }
                });
            });
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

        const accomodationPolicy = {
            accommodationPolicy: this.resourceService.accommodationPolicy$.getValue()
        }

        console.log('payment end date', combineForms.value?.startDate);

        // Formatted Form Object
        const formObject = {
            title: combineForms.value.title,
            description: combineForms.value.description,
            address: combineForms.value.address,
            country: combineForms.value.country,
            city: combineForms.value.city,
            slug: this.resourceService.resourceId$.getValue() ? '' : combineForms.value.title,
            featuredImage: combineForms.value.thumbnail ? combineForms.value.thumbnail : {filePath: null, fileName: null},
            images: this.resourceService.resourceData.getValue().images,
            videos: this.resourceService.resourceData.getValue().videos !== null ? this.resourceService.resourceData.getValue().videos : [],
            geographicalCoordinates: {
                latitude: combineForms.value.latitude,
                longitude: combineForms.value.longitude
            },
            attributes: attributes,
            categoryId: this.resourceService.resourceTemplateType$.getValue().categoryId,
            bookingPolicies: combineForms.value?.bookingPolicies
                ? {
                    depositRequiredPercentage: combineForms.value.bookingPolicies?.depositRequiredPercentage || 0,
                    depositRequiredAmount: combineForms.value.bookingPolicies?.depositRequiredAmount || 0,
                    advancePartialPaymentPercentage: combineForms.value.bookingPolicies?.advancePartialPaymentPercentage || 0,
                    advanceFullPayment: combineForms.value.bookingPolicies?.advanceFullPayment || false,
                }
                : null,
                startDate:  (combineForms.value?.startDate !== 'Invalid date' && this.currentBookingType === 'culturalBooking') ? moment(combineForms.value?.startDate)?.format('YYYY-MM-DDTHH:mm') : null,
                endDate: (combineForms.value?.endDate !== 'Invalid date' &&  this.currentBookingType === 'culturalBooking') ? moment(combineForms.value?.endDate)?.format('YYYY-MM-DDTHH:mm') : null,
            domain: this.resourceService.resourceTemplateType$.getValue().domain,
            resourceTypeId: this.resourceService.resourceTemplateType$.getValue().resourceTypeId,
            bookingType: this.resourceService.resourceTemplateData$.getValue().bookingType,
            timetable: this.timepickerService.timetableList$.getValue(),
            policy: accomodationPolicy,
            externalUrl: this.resourceService.externalUrl$.getValue(),
            sharedExperience: combineForms.value.sharedExperience,
            forItinerary: combineForms.value.forItinerary
        }


        console.log(formObject)

        // Check if you are on edit or create
        if (this.resourceService.resourceId$.getValue()) {
            // this.currentResourceId =  this.resourceService.resourceId$.getValue();
            console.log('id-ul resursei curente', this.resourceService.resourceId$.getValue());
            this.resourceService.updateResource(this.resourceService.resourceId$.getValue(), formObject).subscribe({
                next: (data: any) => {
                    console.log(data)

                        const currentRelatedRes = this.resourceService.relatedResources$.getValue();
                        const resourceRelatedRes = this.resourceService.resourceTemplateData$.getValue()?.relatedResources;
                        if(resourceRelatedRes?.length > 0 && currentRelatedRes?.length > 0 && currentRelatedRes[0]?.id === resourceRelatedRes[0]){
                            // nu fac nimic
                        }else if(resourceRelatedRes?.length > 0 && currentRelatedRes?.length > 0 && currentRelatedRes[0]?.id !== resourceRelatedRes[0]){
                            this.$fileObservables.push(this.resourceService.removeRelatedResource(resourceRelatedRes[0], this.resourceService.resourceId$.getValue()));
                            this.$fileObservables.push(this.resourceService.addRelatedresources(currentRelatedRes[0].id, this.resourceService.resourceId$.getValue()));
                        }else if((resourceRelatedRes?.length === 0 || !resourceRelatedRes) && currentRelatedRes?.length > 0){
                            this.$fileObservables.push(this.resourceService.addRelatedresources(currentRelatedRes[0].id, this.resourceService.resourceId$.getValue()));
                        }else if(resourceRelatedRes?.length > 0 && currentRelatedRes?.length === 0){
                            this.$fileObservables.push(this.resourceService.removeRelatedResource(resourceRelatedRes[0], this.resourceService.resourceId$.getValue()));
                        }

                    if (combineForms.value.thumbnail && (combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)) {
                        const thumbnailData = new FormData();
                        thumbnailData.append('file', combineForms.value.thumbnail);
                        this.$fileObservables.push(this.resourceService.uploadResourceImage(this.resourceService.resourceId$.getValue(), thumbnailData));
                    }

                    if (combineForms.value.images?.length > 0) {
                        const newImages = combineForms.value.images.filter(x => this.resourceService.resourceData.getValue().images.indexOf(x) === -1);
                        console.log('Diferenta arrays', newImages);

                        if (newImages?.length > 0) {
                            const imagesData = new FormData();
                            newImages.forEach(galleryFile => {
                                imagesData.append('files', galleryFile);
                            });
                            this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'image', imagesData));
                        }
                    }

                    if (combineForms.value.videos?.length > 0) {
                        const newVideos = combineForms.value.videos.filter(x => this.resourceService.resourceData.getValue().videos.indexOf(x) === -1);
                        console.log('Diferenta arrays', newVideos);


                        if (newVideos?.length > 0) {
                            const videosData = new FormData();
                            newVideos.forEach(videoFile => {
                                videosData.append('files', videoFile);
                            });
                            this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'video', videosData));
                        }
                    }
                    if (data.success) {
                        // menu
                        if (this.currentBookingType === 'menu') {
                            if (this.menuService.menuId$.getValue() && this.menuService.menuList$.getValue()?.length > 0) {
                                console.log('menuList', this.menuService.menuList$.getValue());
                                this.$fileObservables.push(this.menuService.updateMenu(this.menuService.menuId$.getValue(), this.menuService.menuList$.getValue()));
                            } else {
                                if (this.menuService.menuList$.getValue()?.length > 0) {
                                    this.$fileObservables.push(this.menuService.createMenu(this.resourceService.resourceId$.getValue(), this.menuService.menuList$.getValue()));
                                }

                            }

                        }


                        if (this.ticketService.createArray$.getValue()?.length > 0) {
                            // Create new tickets
                            this.$fileObservables.push(this.ticketService.createTickets(this.currentResourceId, this.ticketService.createArray$.getValue()));
                            // this.ticketService.createTickets(this.currentResourceId, this.ticketService.createArray$.getValue()).subscribe({
                            //     next: (tickets: { success: boolean, reason: string }) => {
                            //         if (tickets.success) {
                            //             // console.log('SE ADAUGA TICKETELE PUSE PE UPDATE', tickets);
                            //             this.ticketService.createArray$.next([]);
                            //             console.log(this.ticketService.createArray$.getValue());
                            //         }
                            //     }
                            // })
                        } else {
                            console.log('n-am in create');
                        }


                        if (this.ticketService.updateArray$.getValue()?.length > 0) {
                            console.log('am in update');
                            //Update tickets
                            const updateArray = this.ticketService.updateArray$.getValue();
                            updateArray.forEach(ticket => {
                                this.$fileObservables.push(this.ticketService.updateTicket(ticket.id, ticket));
                                // this.ticketService.updateTicket(ticket.id, ticket).subscribe({
                                //     next: (tickets: { success: boolean, reason: string }) => {
                                //         if (tickets.success) {
                                //             // console.log('SE FACE UPDATE LA TICKETS PE UPDATE', tickets);
                                //             this.ticketService.updateArray$.next([]);
                                //         }
                                //     }
                                // })
                            })
                        } else {
                            console.log('n-am in update');
                        }


                        if (this.ticketService.deleteArray$.getValue()?.length > 0) {
                            //Delete tickets
                            const deleteArray = this.ticketService.deleteArray$.getValue();
                            deleteArray.forEach(ticket => {
                                // console.log('ticket de sters', ticket)
                                this.$fileObservables.push(this.ticketService.deleteTicket(ticket.id));
                                // this.ticketService.deleteTicket(ticket.id).subscribe({
                                //     next: (tickets: { success: boolean, reason: string }) => {
                                //         if (tickets.success) {
                                //             console.log('SE FACE DELETE LA TICKETS PE UPDATE', tickets);
                                //             this.ticketService.deleteArray$.next([]);
                                //         }
                                //     },
                                //     error: err => {
                                //         console.log(err);
                                //     }
                                //
                                // })
                            })

                        }

                        if (this.productService.productsList$.getValue().length > 0) {
                            const prodArray = this.productService.productsList$.getValue();
                            prodArray.forEach(product => {
                                if (product.state === 'add') {
                                    this.productService.createProduct(this.currentResourceId, product).subscribe({
                                        next: (respAdd: { success: boolean, reason: string }) => {
                                            if (respAdd) {
                                                const imagArray = this.productService.imagesArray$.getValue();
                                                console.log('array', imagArray);
                                                imagArray.forEach(imageObj => {
                                                    if (product.id === imageObj.id) {
                                                        console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                        if (imageObj.imageFile !== undefined) {
                                                            const thumbnailData = new FormData();
                                                            thumbnailData.append('images', imageObj.imageFile);
                                                            console.log('thumb data', thumbnailData);

                                                            // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                            this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                                next: thumb => {
                                                                    console.log('thumbnail uploadat', thumb);
                                                                },error: (error)=>{
                                                                    if(error.error.reason === 'fileSizeTooBig'){
                                                                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                    } else if(error.error.reason === 'wrongExtension'){
                                                                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                    }else{
                                                                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                    }
                                                                }


                                                            })
                                                        }

                                                        this.productService.imagesArray$.next([]);
                                                    }
                                                })

                                                const attachArray = this.productService.attachmentArray$.getValue();
                                                attachArray.forEach(attach => {
                                                    console.log('ATTACHMENT', attach)
                                                    if (product.id === attach.id) {
                                                        console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                        if (attach.attachmentFile !== undefined) {
                                                            const thumbnailData = new FormData();
                                                            thumbnailData.append('file', attach.attachmentFile);
                                                            console.log('thumb data', thumbnailData);

                                                            // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                            this.productService.uploadAttachmentForProduct(respAdd.reason, thumbnailData).subscribe({
                                                                next: thumb => {
                                                                    console.log('attachment uploadat', thumb);
                                                                },error: (error)=>{
                                                                    if(error.error.reason === 'fileSizeTooBig'){
                                                                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                    } else if(error.error.reason === 'wrongExtension'){
                                                                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                    }else{
                                                                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                    }
                                                                }


                                                            })
                                                        }

                                                        this.productService.attachmentArray$.next([]);
                                                    }
                                                })
                                            }
                                        }
                                    })
                                } else if (product.state === 'update') {
                                    this.productService.updateProduct(product.id, product).subscribe({
                                        next: (respUpdate: { success: boolean, reason: string }) => {
                                            console.log('update prod', respUpdate);
                                            if (respUpdate) {
                                                const imagArray = this.productService.imagesArray$.getValue();
                                                console.log('array', imagArray);
                                                imagArray.forEach(imageObj => {
                                                    if (product.id === imageObj.id) {
                                                        console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                        if (imageObj.imageFile !== undefined) {
                                                            const thumbnailData = new FormData();
                                                            thumbnailData.append('images', imageObj.imageFile);
                                                            console.log('thumb data', thumbnailData);

                                                            // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                            this.productService.uploadImageForProduct(product.id, thumbnailData).subscribe({
                                                                next: thumb => {
                                                                    console.log('thumbnail uploadat', thumb);
                                                                },error: (error)=>{
                                                                    if(error.error.reason === 'fileSizeTooBig'){
                                                                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                    } else if(error.error.reason === 'wrongExtension'){
                                                                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                    }else{
                                                                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                    }
                                                                }
                                                            })
                                                        }

                                                        this.productService.imagesArray$.next([]);
                                                    }
                                                })

                                                const attachArray = this.productService.attachmentArray$.getValue();
                                                attachArray.forEach(attach => {
                                                    console.log('ATTACHMENT', attach)
                                                    if (product.id === attach.id) {
                                                        console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                        if (attach.attachmentFile !== undefined) {
                                                            const thumbnailData = new FormData();
                                                            thumbnailData.append('file', attach.attachmentFile);
                                                            console.log('thumb data', thumbnailData);

                                                            // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                            this.productService.uploadAttachmentForProduct(product.id, thumbnailData).subscribe({
                                                                next: thumb => {
                                                                    console.log('attachment uploadat', thumb);
                                                                },error: (error)=>{
                                                                    if(error.error.reason === 'fileSizeTooBig'){
                                                                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                    } else if(error.error.reason === 'wrongExtension'){
                                                                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                    }else{
                                                                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea atasamentului!", "error");
                                                                    }
                                                                }


                                                            })
                                                        }

                                                        this.productService.attachmentArray$.next([]);
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            })
                        }

                        //product list
                        if (this.productService.deleteProdList$.getValue().length > 0) {
                            const deleteProdArray = this.productService.deleteProdList$.getValue();
                            deleteProdArray.forEach(product => {
                                this.productService.deleteProduct(product.id).subscribe({
                                    next: (respAdd: { success: boolean, reason: string }) => {
                                        if (respAdd) {
                                            const imagArray = this.productService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (product.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                    if (imageObj.imageFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('images', imageObj.imageFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            },error: (error)=>{
                                                                if(error.error.reason === 'fileSizeTooBig'){
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if(error.error.reason === 'wrongExtension'){
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                }else{
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.productService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                });
                            })
                        }


                        //service time slot
                        if (this.timeslotService.serviceList$.getValue().length > 0) {
                            const serviceArray = this.timeslotService.serviceList$.getValue();
                            serviceArray.forEach(service => {
                                if (service.state === 'add') {
                                    this.$fileObservables.push(this.timeslotService.createService(this.currentResourceId, service))
                                } else if (service.state === 'update') {
                                    this.$fileObservables.push(this.timeslotService.updateServiceByServiceId(service.id, service));
                                }
                            })
                        }

                        if (this.timeslotService.deleteServiceList$.getValue().length > 0) {
                            const deleteServArray = this.timeslotService.deleteServiceList$.getValue();
                            deleteServArray.forEach(service => {
                                this.$fileObservables.push(this.timeslotService.deleteService(service.id));
                            })
                        }

                        //rental-booking
                        if (this.roomsArray.length > 0) {
                            this.roomsArray.forEach(room => {
                                if (room.state === 'add') {
                                    this.roomService.createRoom(this.currentResourceId, room).subscribe({
                                        next: (resp: { success: boolean, reason: string }) => {
                                            // console.log('adaugare camera pe edit resursa', resp);
                                            if (resp.success) {
                                                const imagArray = this.roomService.imagesArray$.getValue();
                                                console.log('array', imagArray);
                                                imagArray.forEach(imageObj => {
                                                    if (room.id === imageObj.id) {
                                                        console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                        if (imageObj.featuredImage !== undefined) {
                                                            const thumbnailData = new FormData();
                                                            thumbnailData.append('file', imageObj.featuredImage);
                                                            console.log('thumb data', thumbnailData);

                                                            // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                            this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData).subscribe({
                                                                next: thumb => {
                                                                    console.log('thumbnail uploadat', thumb);
                                                                }
                                                            })
                                                        }

                                                        if (imageObj.gallery.length > 0) {
                                                            const imagesData = new FormData();
                                                            imageObj.gallery.forEach(galleryFile => {
                                                                if (galleryFile.state === 'upload') {
                                                                    imagesData.append('images', galleryFile.file);
                                                                }

                                                            });

                                                            // this.$fileObservables.push(this.roomService.uploadRoomGallery(resp.reason, imagesData));
                                                            this.roomService.uploadRoomGallery(resp.reason, imagesData).subscribe({
                                                                next: gallery => {
                                                                    console.log('galerie uploadata', gallery);
                                                                }, error: (error)=>{
                                                                    if(error.error.reason === 'fileSizeTooBig'){
                                                                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                    } else if(error.error.reason === 'wrongExtension'){
                                                                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                    }else{
                                                                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                    }
                                                                }
                                                            })
                                                        }

                                                        this.roomService.imagesArray$.next([]);
                                                    }
                                                })
                                            }
                                        }
                                    })
                                } else if (room.state === 'update') {
                                    this.roomService.updateRoom(room.id, room).subscribe({
                                        next: (resp: { success: boolean, reason: string }) => {
                                            // console.log('editare camera pe edit resursa', resp);
                                            const imagArray = this.roomService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (room.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                    if (imageObj.featuredImage !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', imageObj.featuredImage);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push(this.roomService.uploadRoomThumbnail(room.id, thumbnailData));
                                                        this.roomService.uploadRoomThumbnail(room.id, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }, error: (error)=>{
                                                                if(error.error.reason === 'fileSizeTooBig'){
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if(error.error.reason === 'wrongExtension'){
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                }else{
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    if (imageObj.gallery.length > 0) {
                                                        console.log('inainte de gall', imageObj.gallery);
                                                        const imagesData = new FormData();
                                                        imageObj.gallery.forEach(galleryFile => {
                                                            if (galleryFile.state === 'upload') {
                                                                imagesData.append('images', galleryFile.file);
                                                            }

                                                        });

                                                        // this.$fileObservables.push( this.roomService.uploadRoomGallery(room.id, imagesData));
                                                        this.roomService.uploadRoomGallery(room.id, imagesData).subscribe({
                                                            next: gallery => {
                                                                console.log('galerie uploadata', gallery);
                                                            }, error: (error)=>{
                                                                if(error.error.reason === 'fileSizeTooBig'){
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if(error.error.reason === 'wrongExtension'){
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                }else{
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.roomService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }

                        if (this.roomService.deleteArray$.getValue().length > 0) {
                            const deleteRooms = this.roomService.deleteArray$.getValue();
                            deleteRooms.forEach(room => {
                                this.$fileObservables.push(this.roomService.deleteRoom(room.id));
                                // this.roomService.deleteRoom(room.id).subscribe({
                                //     next: (resp: { success: boolean, reason: string }) => {
                                //         console.log('stergere camera', resp);
                                //         if (resp.success) {
                                //             this.roomService.deleteArray$.next([]);
                                //         }
                                //     }
                                // })
                            })
                        }

                        // cultural booking
                        if (this.currentBookingType === 'culturalBooking' && this.culturalBookingService.culturalRoom$.getValue()) {
                            const modifiedCulturalRoom = this.culturalBookingService.culturalRoom$.getValue();
                            this.$fileObservables.push(this.culturalBookingService.updateCulturalRoom(modifiedCulturalRoom.id, modifiedCulturalRoom));
                        }

                        //menu-booking
                        if (this.timepickerService.timepickerId$.getValue()) {
                            const timepicker = {
                                timetables: this.timepickerService.getFreeEntry() ? [] : this.timepickerService.timePicker$.getValue().timetables,
                                bookingPolicies: this.timepickerService.bookingPolicies$.getValue(),
                                changePolicies: this.timepickerService.changePolicies$.getValue(),
                                ignoreAvailability: this.timepickerService.getFreeEntry()
                            }
                            console.log('TIMEPICKER AICI', timepicker);
                            this.$fileObservables.push(this.timepickerService.updateTimepicker(this.timepickerService.timepickerId$.getValue(), timepicker));
                        }

                    }

                    if (this.$fileObservables.length > 0) {
                        forkJoin(...this.$fileObservables).subscribe((forkRes: any) => {
                            this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                            setTimeout(() => {
                                if (this.isProvider) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                                } else if (this.isStaff) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                                } else if (this.isAdmin) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                                }
                            }, 3000);
                        });
                    } else {
                        this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                        setTimeout(() => {
                            if (this.isProvider) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                            } else if (this.isStaff) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                            } else if (this.isAdmin) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                            }
                        }, 3000);
                    }


                }


            })

        } else {
            const providerId = this.createResourceService.providerData$.getValue()?.providerId ? this.createResourceService.providerData$.getValue().providerId : null;
            this.resourceService.addResource(formObject, providerId).subscribe({
                next: (data: any) => {
                    console.log(data)

                    if(this.resourceService.relatedResources$.getValue()?.length > 0){
                        this.$fileObservables.push(this.resourceService.addRelatedresources(data.reason, this.resourceService.relatedResources$.getValue()[0].id));
                    }

                    if (combineForms.value.thumbnail) {
                        const thumbnailData = new FormData();
                        thumbnailData.append('file', combineForms.value.thumbnail);
                        this.$fileObservables.push(this.resourceService.uploadResourceImage(data.reason, thumbnailData));
                    }

                    // const newImages = combineForms.value.images.filter(x => this.resourceService.resourceData.getValue().images.indexOf(x) === -1);
                    // console.log('Diferenta arrays', newImages);

                    console.log('IMAGE', combineForms.value.images?.length)

                    if (combineForms.value.images?.length > 0) {
                        const imagesData = new FormData();
                        combineForms.value.images.forEach(galleryFile => {
                            imagesData.append('files', galleryFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(data.reason, 'image', imagesData));
                    }
                    if (combineForms.value?.videos?.length > 0) {
                        const videosData = new FormData();
                        combineForms.value.videos.forEach(galleryFile => {
                            videosData.append('files', galleryFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(data.reason, 'video', videosData));
                    }

                    if (this.resourceService.resourceTemplateData$.getValue().bookingType === 'menu') {
                        const timepicker = {
                            timetables: this.timepickerService.getFreeEntry() ? [] : this.timepickerService.timePicker$.getValue().timetables,
                            bookingPolicies: this.timepickerService.bookingPolicies$.getValue(),
                            changePolicies: this.timepickerService.changePolicies$.getValue(),
                            ignoreAvailability: this.timepickerService.getFreeEntry()
                        }
                        this.$fileObservables.push(this.timepickerService.createTimepicker(data.reason, timepicker));
                        console.log('TIMEPICKER AICI', timepicker);
                    }


                    if (this.roomsArray.length > 0) {
                        this.roomsArray.forEach(room => {
                            this.roomService.createRoom(data.reason, room).subscribe({
                                next: (res: { success: boolean, reason: string }) => {
                                    if (res.success) {
                                        console.log('SE ADAUGA O CAMERA', res.success);

                                        const imagArray = this.roomService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (room.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                if (imageObj.featuredImage !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('file', imageObj.featuredImage);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push(this.roomService.uploadRoomThumbnail(res.reason, thumbnailData));
                                                    this.roomService.uploadRoomThumbnail(res.reason, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        }, error: (error)=>{
                                                            if(error.error.reason === 'fileSizeTooBig'){
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if(error.error.reason === 'wrongExtension'){
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            }else{
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }
                                                    })
                                                }

                                                if (imageObj.gallery.length > 0) {
                                                    const imagesData = new FormData();
                                                    imageObj.gallery.forEach(galleryFile => {
                                                        imagesData.append('images', galleryFile);
                                                    });

                                                    // this.$fileObservables.push(this.roomService.uploadRoomGallery(res.reason, imagesData));
                                                    this.roomService.uploadRoomGallery(res.reason, imagesData).subscribe({
                                                        next: gallery => {
                                                            console.log('galerie uploadata', gallery);
                                                        }, error: (error)=>{
                                                            if(error.error.reason === 'fileSizeTooBig'){
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if(error.error.reason === 'wrongExtension'){
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            }else{
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }
                                                    })
                                                }


                                                this.roomService.imagesArray$.next([]);
                                            }
                                        })
                                    }
                                }
                            })
                        })


                    }

                    if (this.productService.productsList$.getValue().length > 0) {
                        console.log('exista in product list')
                        this.productService.productsList$.getValue().forEach(product => {
                            this.productService.createProduct(data.reason, product).subscribe({
                                next: (respAdd: { success: boolean, reason: string }) => {
                                    if (respAdd) {
                                        const imagArray = this.productService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (product.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                if (imageObj.imageFile !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('images', imageObj.imageFile);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                    this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        },error: (error)=>{
                                                            if(error.error.reason === 'fileSizeTooBig'){
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if(error.error.reason === 'wrongExtension'){
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            }else{
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }


                                                    })
                                                }

                                                this.productService.imagesArray$.next([]);
                                            }
                                        })

                                        const attachArray = this.productService.attachmentArray$.getValue();
                                        attachArray.forEach(attach => {
                                            console.log('ATTACHMENT', attach)
                                            if (product.id === attach.id) {
                                                console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                if (attach.attachmentFile !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('file', attach.attachmentFile);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                    this.productService.uploadAttachmentForProduct(respAdd.reason, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('attachment uploadat', thumb);
                                                        },error: (error)=>{
                                                            if(error.error.reason === 'fileSizeTooBig'){
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if(error.error.reason === 'wrongExtension'){
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            }else{
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }


                                                    })
                                                }

                                                this.productService.attachmentArray$.next([]);
                                            }
                                        })
                                    }
                                }
                            })

                        })
                    }


                    // Create tickets
                    this.ticketService.ticketListData().subscribe(
                        {
                            next: ticketList => {
                                if (ticketList.length > 0) {
                                    this.$fileObservables.push(this.ticketService.createTickets(data.reason, this.ticketService.ticketsList$.getValue()));

                                }
                            }
                        }
                    )

                    if (this.timeslotService.serviceList$.getValue().length > 0) {
                        this.timeslotService.serviceList$.getValue().forEach(service => {
                            this.$fileObservables.push(this.timeslotService.createService(data.reason, service));
                        })

                    }

                    // create cultural room
                    if (this.culturalBookingService.culturalRoom$.getValue()) {
                        const newCulturalRoom = this.culturalBookingService.culturalRoom$.getValue();
                        this.$fileObservables.push(this.culturalBookingService.createCulturalRoom(data.reason, newCulturalRoom));
                    }

                    if (this.menuService.menuList$.getValue().length > 0) {
                        this.$fileObservables.push(this.menuService.createMenu(data.reason, this.menuService.menuList$.getValue()));
                    }

                    if (this.$fileObservables.length > 0) {
                        forkJoin(...this.$fileObservables).subscribe((forkRes: any) => {
                            this.toastService.showToast('succes', 'Resursa a fost adăugată cu succes', 'success');
                            setTimeout(() => {
                                if (this.isProvider) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                                } else if (this.isStaff) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                                } else if (this.isAdmin) {
                                    this.isSubmitLoading$.next(false);
                                    this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                                }
                            }, 3000);

                        });
                    } else {
                        this.toastService.showToast('succes', 'Resursa a fost adăugată cu succes', 'success');
                        setTimeout(() => {
                            if (this.isProvider) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                            } else if (this.isStaff) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                            } else if (this.isAdmin) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                            }
                        }, 3000);
                    }


                },
                error: (error) => {
                    this.toastService.showToast('Eroare', 'A aparut o problema tehnica!', 'error');
                    this.isSubmitLoading$.next(false);
                    console.log(error)
                }
            })

        }
    }

    /** Go to previous step*/
    prevStep() {
        this.stepperService.prevStep()
    }

    ngOnDestroy(): void {
    }

}
