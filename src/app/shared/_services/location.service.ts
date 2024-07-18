import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class LocationService {

    constructor(
        public http: HttpClient) {}


    getAllCountries() {
        return this.http.get('/bestinform/getAllCountries');
    }

    getCityFilter(page: number, size: number, sort?: string, dir?: string, filters?) {
        return this.http.post('/bestinform/listCityFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

}
