import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class LandingService {

    constructor(private http: HttpClient) {
    }

    createLandingContact(formBody: object) {
        return this.http.post('/bestinform/createLandingContact', formBody);
    }

    updateLandingSubscription(formBody: object){
        return this.http.put('/bestinform/updateLandingSubscription', formBody);
    }

}
