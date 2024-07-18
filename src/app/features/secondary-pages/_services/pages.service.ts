import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class PagesService {
    constructor(private http: HttpClient) {}

    listSecondaryPages() {
        return this.http.get('/bestinform/listSecondaryPage');
    }

    getSecondaryPageById(id: string) {
        return this.http.get('/bestinform/getSecondaryPageById?secondaryPageId=' + id);
    }
}
