import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SystemSetting} from "../_models/system-setting.model";
import {BehaviorSubject, of, switchMap} from "rxjs";
import {ResourceType} from "../_models/resource-type.model";

@Injectable({
    providedIn: 'root'
})
export class SystemSettingsService {

    private systemSettingState = new BehaviorSubject<SystemSetting>(null);
    public systemSetting$ = this.systemSettingState.asObservable();

    constructor(private http: HttpClient) {
    }

    getSystemSetting() {
        return this.http.get<SystemSetting>('/bestinform/getSystemSetting')
            .pipe(
                switchMap(res => {
                    if (res) {
                        this.systemSettingState.next(res);
                        return this.systemSetting$;
                    }
                })
            )
    }

    updateSystemSetting(systemBody: SystemSetting) {
        return this.http.post<{ success: boolean, reason: string }>('/bestinform/updateSystemSetting', systemBody)
            .pipe(
                switchMap((res: { success: boolean, reason: string }) => {
                    if (res.success) {
                        this.systemSettingState.next(systemBody);
                    }
                    return of(res);
                })
            );
    }

    getItineraryResourceTypeWithName() {
        return this.http.get('/bestinform/getItineraryResourceTypeWithName');
    }

    getRentalBookingResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getRentalBookingResourceTypes');
    }

    getTicketBookingResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getTicketBookingResourceTypes');
    }

    getMenuResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getMenuResourceTypes');
    }


}
