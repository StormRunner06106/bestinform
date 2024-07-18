import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "./localStorage.service";
import {Observable} from "rxjs";
import {User} from "../_models/user.model";
import {GenericPagination} from "../_models/generic-pagination.model";
import {City} from "../_models/city.model";
import {CurrentSubscription} from "../_models/current-subscription.model";

export type SubscriptionFilters = {
    subscriptionId?: string;
    status?: string;
    userId?: string;
    purchasedDate?: string;
    expirationDate?: string;
    stripeSubscriptionId?: string;
}

@Injectable({
    providedIn: "root",
})
export class UserDataService {

    constructor(
        public http: HttpClient,
        public localStorage: LocalStorageService
    ) {
    }

    baseApiUrl = "/bestinform/uploadUserContract";
    baseCoverImgApiUrl = "/bestinform/uploadUserCoverImage";
    baseAvatarImgApiUrl = "/bestinform/uploadAvatar";


    // Returns an observable

    //upload contract for any user id
    uploadUserContract(userId: string, file: string | Blob): Observable<object> {

        // Create form data
        const formData = new FormData();

        // Store form name as "file" with file data
        formData.append("file", file);

        // Make http post request over api
        // with formData as req
        return this.http.post(this.baseApiUrl + '?userId=' + userId, formData)
    }

    //upload contract for current user
    uploadCurrentUserContract(file: string | Blob): Observable<any> {

        // Create form data
        const formData = new FormData();

        // Store form name as "file" with file data
        formData.append("file", file);

        // Make http post request over api
        // with formData as req
        return this.http.post(this.baseApiUrl, formData)
    }

    uploadUserCoverImage(coverFile: string | Blob): Observable<any> {

        // Create form data
        const formData = new FormData();

        // Store form name as "file" with file data
        formData.append("coverFile", coverFile);

        // Make http post request over api
        // with formData as req
        return this.http.post(this.baseCoverImgApiUrl, formData)

    }

    uploadUserAvatar(file: string | Blob): Observable<any> {

        // Create form data
        const formData = new FormData();

        // Store form name as "file" with file data
        formData.append("file", file);

        // Make http post request over api
        // with formData as req
        return this.http.post(this.baseAvatarImgApiUrl, formData)

    }

    addUser(user: object) {
        return this.http.post("/bestinform/addUser", user);
    }

    getJWTToken() {
        return this.localStorage.get('token');
    }

    getCurrentUser() {
        return this.http.get<User>("/bestinform/getCurrentUser");
    }

    getUserById(userId: string) {
        return this.http.get("/bestinform/getUserById?userId=" + userId);
    }

    updateCurrentUser(user: object) {
        return this.http.put("/bestinform/updateCurrentUser", user);
    }

    updateUser(userId: string, user: object) {
        return this.http.put("/bestinform/updateUser?userId=" + userId, user);
    }

    deleteUser(userId: string) {
        return this.http.delete('/bestinform/deleteUser?userId=' + userId);
    }

    uploadAvatar(image) {
        return this.http.post("/bestinform/uploadAvatar", image);
    }

    // uploadUserCoverImage(coverFile){
    //     return this.http.post("/bestinform/uploadUserCoverImage",coverFile);
    // }

    deleteProfileImage() {
        return this.http.put("/bestinform/deleteProfileImage", {});
    }


    changeUserStatus(userId: string, approvedStatus: string) {
        return this.http.put("/bestinform/changeUserStatus?userId=" + userId + '&approvedStatus=' + approvedStatus, {});
    }

    changePassword(oldPassword: string, newPassword: string) {
        return this.http.put("/bestinform/changePassword", {oldPassword: oldPassword, newPassword: newPassword});
    }

    updateUserProfile(user: object) {
        return this.http.put("/bestinform/updateUserProfile", user);
    }

    sendRegistrationEmail(userId: string) {
        return this.http.get("/bestinform/sendRegistrationEmail?userId=" + userId);
    }

    getCurrentSetting() {
        return this.http.get("/bestinform/getCurrentSetting");
    }

    updateCurrentSetting(setting: object) {
        return this.http.put("/bestinform/updateCurrentSetting", setting);
    }


    listUsersFiltered(page: number, size: number, sort?: string, dir?: string, filters?: any) {
        return this.http.post('/bestinform/listUsersFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters ? filters : {});
    }

    executeRecurringPayments() {
        return this.http.post('/bestinform/executeRecurringPayments', {})
    }

    changeActiveStatus(targetUserId: string, accept: boolean) {
        return this.http.put('/bestinform/changeActiveStatus?targetUserId=' + targetUserId + '&accept=' + accept, {});
    }

    getAllCountries() {
        return this.http.get<string[]>('/bestinform/getAllCountries');
    }

    listCityFiltered(page: number, size: number, filters: { name?: string, country?: string }) {
        return this.http.post<GenericPagination<City>>('/bestinform/listCityFiltered?page=' + page + '&size=' + size, filters);
    }

    getCurrentPurchasedSubscription() {
        return this.http.get<CurrentSubscription>('/bestinform/getCurrentPurchasedSubscription');
    }

    listPurchasedSubscriptionsFiltered(page: number, size: number, sort: string, dir: string, filters: SubscriptionFilters) {
        return this.http.post<GenericPagination<CurrentSubscription>>('/bestinform/listPurchasedSubscriptionsFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    cancelSubscription(subId: string) {
        return this.http.post<{ success: boolean, reason: string }>('/bestinform/cancelSubscription?purchasedSubscriptionId=' + subId, {});
    }


    makeAutoRenewTrue(subscriptionId: string) {
        return this.http.put('/bestinform/makeAutoRenewTrue?purchasedSubscriptionId=' + subscriptionId, {});
    }
}
