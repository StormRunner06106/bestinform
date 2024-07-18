import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Category} from "../_models/category.model";
import {ResourceType} from "../_models/resource-type.model";
import {Resource} from "../_models/resource.model";
import {PaginationResponse} from "../_models/pagination-response.model";
import {Domain} from "../_models/domain.model";
import {BehaviorSubject} from 'rxjs';
import {ResourceFilters} from "../_models/resource-filters.model";

@Injectable({
    providedIn: 'root'
})
export class ResourcesService {

    // Functions For Changes Detection
    private listChanged = new BehaviorSubject(false);
    listChangedObs = this.listChanged.asObservable();

    // Trigger list changes
    triggerListChanges(message: boolean) {
        // Change the subject value
        this.listChanged.next(message);
    }

    constructor(private http: HttpClient) {
    }

    getAttributesFromTemplate(id: string) {
        return this.http.get('/bestinform/getAttributesFromTemplate?resourceTemplateId=' + id)
    }

    getListOfDomains() {
        return this.http.get('/bestinform/getListOfDomains');
    }

    getResourceByDomain(resourceDomain: string) {
        return this.http.get('/bestinform/getAllResourceCategoriesByResourceDomain?resourceDomain=' + encodeURIComponent(resourceDomain));
    }

    getResourceCategoryById(categoryId: string) {
        return this.http.get<Category>('/bestinform/getResourceCategoryById?resourceCategoryId=' + categoryId);
    }

    updateResourceCategory(categoryId: string, resCategory: Category) {
        return this.http.put('/bestinform/updateResourceCategory?resourceCategoryId=' + categoryId, resCategory);
    }

    getAllResourceTypes() {
        return this.http.get('/bestinform/getAllResourceTypes');
    }

    getAllResourceCategoriesByResourceDomain(domainId: string, hideCategories?: boolean) {
        return this.http.get<Category[]>('/bestinform/getAllResourceCategoriesByResourceDomain?resourceDomain=' + domainId + '&hideCategories=' + (hideCategories ? hideCategories : false));
    }

    getAllResourceTypesByResourceCategory(id) {
        return this.http.get<ResourceType[]>('/bestinform/getAllResourceTypesByResourceCategory?resourceCategoryId=' + id);
    }

    deleteResourceTypeById(id: string) {
        return this.http.delete('/bestinform/deleteResourceTypeById?resourceTypeId=' + id);
    }

    getResourceTypeById(resourceTypeId) {
        return this.http.get<ResourceType>('/bestinform/getResourceTypeById?resourceTypeId=' + resourceTypeId);
    }


    deleteResourceCategory(resourceId: string) {
        return this.http.delete('/bestinform/deleteCategoryById?resourceCategoryId=' + resourceId);
    }

    getMaxOrderForCategory(domainId) {
        return this.http.get('/bestinform/getMaxOrderByDomainId?domainId=' + domainId);
    }

    getMaxOrderForResType(categoryId) {
        return this.http.get('/bestinform/getMaxOrderByCategoryId?categoryId=' + categoryId);
    }

    addResourceCategory(category) {
        return this.http.post('/bestinform/addResourceCategory', category);
    }

    // addReviewToResource(reservationId, review:boolean) {
    //     return this.http.post('/bestinform/addReviewToResource?reservationId='+reservationId+'&review='+review,{});
    // }

    //changeReservationStatus
    addReviewToResource(reservationId: string, review: boolean) {
        return this.http.post('/bestinform/addReviewToResource?reservationId=' + reservationId + '&review=' + review, {});
    }

    addResourceType(resType) {
        return this.http.post('/bestinform/addResourceType', resType);
    }

    listCategoryFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/listResourceCategoriesFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    //resources list
    listResourceFiltered(page: number, size: number, sort?: string, dir?: string, filters?: ResourceFilters) {
        return this.http.post<PaginationResponse>('/bestinform/listResourceFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters ? filters : {});
    }

    getSearchResources(page: number, size: number, filters?: ResourceFilters) {
        return this.http.post<PaginationResponse>('/bestinform/getSearchResources?page=' + page + '&size=' + size, filters ? filters : {});
    }

    updateResourceType(resTypeId, resType) {
        return this.http.put('/bestinform/updateResourceType?resourceTypeId=' + resTypeId, resType);
    }

    getResourceById(resourceId) {
        return this.http.get<Resource>('/bestinform/getResourceById?resourceId=' + resourceId);
    }

    getAttributes(attributesList) {
        return this.http.post('/bestinform/getAttributes', attributesList);
    }

    getAttributeCategories(categoryList) {
        return this.http.post('/bestinform/getAttributeCategories', categoryList)
    }


    //Favorites resources
    getMyFavoritesResources(language: string) {
        return this.http.get('/bestinform/getMyFavoriteResources?language=' + language);
    }

    deleteResourceFromFavorite(resourceId: string) {
        return this.http.post<{ success: boolean, reason: string }>('/bestinform/deleteResourceFromFavorites?resourceId=' + resourceId, {});
    }

    addResourceToFavorite(resourceId: string) {
        return this.http.post<{ success: boolean, reason: string }>('/bestinform/addResourceToFavorites?resourceId=' + resourceId, {});
    }


    getDomainById(domainId: string) {
        return this.http.get<Domain>('/bestinform/getDomainById?domainId=' + domainId);
    }


    //temporar
    deleteResource(resourceId: string) {
        return this.http.delete('/bestinform/deleteResource?resourceId=' + resourceId);
    }

    changeStatusForResource(resourceId: string, status: string) {
        return this.http.put('/bestinform/changeResourceStatus?resourceId=' + resourceId + '&status=' + status, {});
    }

    getTimepickerByResourceId(resourceId: string) {
        return this.http.get('/bestinform/getBookingTimePickerByResourceId?resourceId=' + resourceId);
    }

    getRoomById(roomId: string) {
        return this.http.get('/bestinform/getRoomById?roomItemId=' + roomId);
    }

    getProductsByResourceId(resourceId: string) {
        return this.http.get('/bestinform/getProductListByResourceId?resourceId=' + resourceId);
    }

    getTimeslotsByResourceId(resourceId: string) {
        return this.http.get('/bestinform/getBookingTimeSlotListByResourceId?resourceId=' + resourceId);
    }

    getAvailableSlotByDate(timeslotId: string, date: string) {
        return this.http.get('/bestinform/getAvailableSlotsByDate?bookingTimeSlotId=' + timeslotId + '&date=' + date);
    }

}
