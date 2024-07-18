import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()

export class FeatureEditorialsService {
    constructor(private http: HttpClient) {}

    public listEditorialFiltered(page: number = 0 , size: number = 10, sort?: string | null, dir?: string | null, filterParams?: object) {
        return this.http.post('/bestinform/listEditorialFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filterParams);
    }

    public getEditorialsCategories(): Observable<any> {
        return this.http.get('/bestinform/getEditorialCategories')
    }
}
