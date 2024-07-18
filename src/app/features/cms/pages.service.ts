import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class PagesService {
    constructor(private http: HttpClient) {
    }

    getSecondaryPageById(pageId :string){
        return this.http.get("/bestinform/getSecondaryPageById?secondaryPageId="+ pageId );
    }

    updateSecondaryPage(pageId: string, pageContent: any) {
        return this.http.put("/bestinform/updateSecondaryPage?secondaryPageId="+ pageId,pageContent);
    }
}
