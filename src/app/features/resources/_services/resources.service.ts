import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ResourceTemplateFilteredModel} from "../../providers-management/_models/resource-template-filtered.model";
import {BehaviorSubject, Observable, switchMap} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Resource} from "../../../shared/_models/resource.model";
import {RestaurantWithLocation} from "../_models/RestaurantWithLocation";

@Injectable({
    providedIn: 'root'
})
export class ResourcesService {


    resourceId$ = new BehaviorSubject(undefined);
    bookingType$ = new BehaviorSubject(undefined);
    services$ = new BehaviorSubject([]);
    orderInfo$ = new BehaviorSubject(undefined);

    //cazare
    // resourceTemplateType$ = new BehaviorSubject({
    //     domain: "63bfcca765dc3f3863af755c",
    //     categoryId: "63d2ae569d6ce304608d1a88",
    //     resourceTypeId: "63d8d4a9d2180d7935acb4e0"
    // });

    //tickets
    // resourceTemplateType$ = new BehaviorSubject({
    //     domain: "63bfcca765dc3f3863af755c",
    //     categoryId: "63f46cb490ee904cfdad0c38",
    //     resourceTypeId: "63f46d1190ee904cfdad0c3a"
    // });

    //restaurants
    // resourceTemplateType$ = new BehaviorSubject({
    //     domain: "63bfcca765dc3f3863af755c",
    //     categoryId: "63dbb183df393f737216183c",
    //     resourceTypeId: "63dbb18cdf393f737216183d"
    // });
    resourceTemplateType$ = new BehaviorSubject(undefined);

    settingsTripsItineraries$ = new BehaviorSubject([]);
    tripsItinerariesObject$ = new BehaviorSubject(undefined);

    resourceTemplateData$ = new BehaviorSubject(undefined)
    attributesFromResourceTemplate$ = new BehaviorSubject(undefined)

    // Resource Form
    generalInformationForm$ = new BehaviorSubject(new FormGroup({}))
    facilitiesForm$ = new BehaviorSubject(new FormGroup({}))
    filesForm$ = new BehaviorSubject(new FormGroup({}))
    facilitiesByCategory$ = new BehaviorSubject([])
    timetable$ = new BehaviorSubject({});
    bookingPolicies$ = new BehaviorSubject({});

    resourceData = new BehaviorSubject({
        featuredImage: undefined,
        images: [],
        videos: [],
        restaurant: undefined,
    })

    externalUrl$ = new BehaviorSubject(undefined);

    accommodationPolicy$ = new BehaviorSubject({});
    relatedResources$ = new BehaviorSubject([]);

    setupListener$ = new BehaviorSubject(false);
    generalInfoListener$ = new BehaviorSubject(false);
    policyRentalListener$ = new BehaviorSubject(false);
    policyMenuListener$ = new BehaviorSubject(false);
    policyListener$ = new BehaviorSubject(false);

    travelId$ = new BehaviorSubject(undefined);
    medicalId$ = new BehaviorSubject(undefined);
    educationId$ = new BehaviorSubject(undefined);

    public publicTransportForm: FormGroup = new FormGroup<any>({
        transports: new FormArray([])
    });

    public nearByForm: FormGroup = new FormGroup<any>({
        nearBy: new FormArray([])
    });

    public attractionsForm: FormGroup = new FormGroup<any>({
        attractions: new FormArray([])
    });

    public airportsForm: FormGroup = new FormGroup<any>({
        airports: new FormArray([])
    });

    public avgPriceForm: FormGroup = new FormGroup<any>({
        avgPriceControl: new FormControl('')
    })



    constructor(private http: HttpClient) {
    }

    listenForSetup() {
        return this.setupListener$.asObservable();
    }

    listenForGeneralInfo() {
        return this.generalInfoListener$.asObservable();
    }

    listenForPolicyRental() {
        return this.policyRentalListener$.asObservable();
    }

    listenForPolicyMenu(){
        return this.policyMenuListener$.asObservable();
    }

    listenForPolicy(){
        return this.policyListener$.asObservable();
    }


    /** Stepper Listener*/
    getTemplateType() {
        return this.resourceTemplateType$.asObservable()
    }

    getResourceId() {
        return this.resourceId$.asObservable()
    }

    getBookingType(){
        return this.bookingType$.asObservable();
    }

    getFacilitiesByCategory() {
        return this.facilitiesByCategory$.asObservable()
    }

    getAttributesData() {
        return this.attributesFromResourceTemplate$.asObservable();
    }

    public getRestaurantById(restaurantId: string) {
        return this.http
            .get<Resource>("/bestinform/restaurants/" + restaurantId)
    }

    addTripsId(tripId) {
        this.settingsTripsItineraries$.next(this.settingsTripsItineraries$.getValue().concat(tripId));
    }


    /** Add Template  */
    addTemplate(templateType) {
        this.resourceTemplateType$.next(templateType)
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }

    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    createImagesOnServer(files?: any[]): Observable<any> {
        const formData: FormData = new FormData();
        const rString = this.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        // Add file extension
        files.forEach((file, index) => {
            const fileType = file?.type?.split('/')[1];
            formData.append(`files`, new Blob([file]), rString + index + '.' + fileType);
        });

        return this.http.post<any>('/bestinform/uploadFile', formData);
    }

    getHotelInfo(): Observable<any> {
        return this.http.post<any>('https://bestinform.eu/bestinform/hotel/info', { "language": "ro", "id": "city_crown_apartments"});
    }


    /** API Requests  */
    getListOfDomains() {
        return this.http.get('/bestinform/getListOfDomains');
    }

    getAllResourceCategoriesByResourceDomain(id: string) {
        return this.http.get('/bestinform/getAllResourceCategoriesByResourceDomain?resourceDomain=' + id)
    }

    getAllResourceTypesByResourceCategory(id: string) {
        return this.http.get('/bestinform/getAllResourceTypesByResourceCategory?resourceCategoryId=' + id)
    }

    getListResourceTemplateFiltered(page: number, size: number, sort: string, dir: string, filterParams: ResourceTemplateFilteredModel) {

        const sortAfter = sort.length > 0 ? '&sort=' + sort : ''
        const filterDir = dir.length > 0 ? '&dir=' + dir : ''

        return this.http.post('/bestinform/listResourceTemplateFiltered?page=' + page + '&size=' + size + sortAfter + filterDir, filterParams)
    }

    getAttributesFromTemplate(id: string) {
        return this.http.get('/bestinform/getAttributesFromTemplate?resourceTemplateId=' + id)
    }

    addResource(data: any, userId?: string) {
        if (userId) {
            return this.http.post('/bestinform/addResource?userId=' + userId, data);
        } else {
            return this.http.post('/bestinform/addResource', data);
        }
    }


    updateResource(id: string, data: any) {
        if (!data.fileName && data.featuredImage.includes("restaurants")) {
            data.featuredImage = {
                fileName: data.featuredImage.split("restaurants/")[1],
                filePath: data.featuredImage.split(data.featuredImage.split("restaurants/")[1])[0]
            }
        }
        const images = [];
        data.images.forEach(img => {
            if (!img.fileName && img.includes("restaurants")) {
                images.push({
                    fileName: img.split("restaurants/")[1],
                    filePath: img.split(img.split("restaurants/")[1])[0]
                });
            } else {
                images.push(img);
            }
        });
        data.images = images;
        debugger;
        return this.http.put('/bestinform/updateResource?resourceId=' + id, data)
    }

    addRestaurant(data: any, userId: string) {
        return this.http.post('/bestinform/restaurants/create?userId=' + userId, data);
    }

    updateRestaurant(data: any, restaurantId: string): Observable<any> {
        return this.http.put('/bestinform/restaurants/' + restaurantId, data);
    }

    getResourceById(id: string) {
        return this.http.get('/bestinform/getResourceById?resourceId=' + id)
    }

    getAttributes(data: Array<string>) {
        return this.http.post('/bestinform/getAttributes', data)
    }

    getAttributesByNames(data: any) {
        return this.http.post('/bestinform/getAttributesByNames', data)
    }

    uploadResourceImage(resourceId: string, file: object) {
        return this.http.post('/bestinform/uploadResourceImage?resourceId=' + resourceId, file);
    }

    uploadDocAttachements(resourceId: string, type: string, file: object) {
        return this.http.post('/bestinform/uploadDocAttachments?resourceId=' + resourceId + '&type=' + type, file);
    }

    // uploadDocAttachements(resourceId: string, type: boolean, file: object) {
    //     return this.http.post('/bestinform/uploadDocAttachments?resourceId=' + resourceId + '&image=' + type, file);
    // }

    getAttributeById(attrId: string) {
        return this.http.get('/bestinform/getAttributeById?attributeId=' + attrId);
    }

    changeStatusForResource(resourceId: string, status: string) {
        return this.http.put('/bestinform/changeResourceStatus?resourceId=' + resourceId + '&status=' + status, {});
    }


    //LOCATION

    getAllCountries() {
        return this.http.get('/bestinform/getAllCountries');
    }

    getCityFilter(page: number, size: number, sort?: string, dir?: string, filters?) {
        return this.http.post('/bestinform/listCityFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    getTimepickerByResourceId(resourceId: string){
        return this.http.get('/bestinform/getBookingTimePickerByResourceId?resourceId=' + resourceId);
    }

    //Related res
    addRelatedresources(targetResourceId: string, eventId: string){
        return this.http.put('/bestinform/addRelatedResource?targetResourceId='+targetResourceId+'&eventId='+eventId, {});
    }

    removeRelatedResource(eventId: string, targetResourceId: string){
        return this.http.put('/bestinform/removeRelatedResource?eventId='+ eventId+'&targetResourceId=' + targetResourceId, {});
    }

    getRestaurantLocationsWithGeo(): Observable<RestaurantWithLocation[]> {
        return this.http.get<RestaurantWithLocation[]>("/bestinform/restaurants/locationsWithGeo");
    }

}
