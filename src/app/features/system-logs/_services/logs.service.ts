import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class LogsService {
    constructor(private http: HttpClient) {}

    listLogsFiltered(page: number, size: number, sort?: string | null, dir?: string | null, filterParams?: object) {
        return this.http.post('/bestinform/listLogsFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filterParams);
    }

}
