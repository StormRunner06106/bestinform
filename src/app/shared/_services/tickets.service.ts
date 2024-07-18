import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class TicketService {

    private formValues: FormData;

    constructor(private http: HttpClient) {
    }

    getPlaneTickets() {
        return this.http.get('/bestinform/getPlaneTickets');
    }

    getTrainTickets() {
        return this.http.get('/bestinform/getTrainTickets');
    }

    getCars() {
        return this.http.get('/bestinform/getCars');
    }

    setTrainFormData(values) {
        this.formValues = {...values};
    }

    getTrainFormValues() {
        return this.formValues;
    }
}
