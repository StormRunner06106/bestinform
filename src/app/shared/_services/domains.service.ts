import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Domain} from "../_models/domain.model";

@Injectable({
    providedIn: 'root'
})

export class DomainsService {

     // Functions For Changes Detection
  private domainChanged = new BehaviorSubject(false);
  domainChangedChangedObs = this.domainChanged.asObservable();

  // Trigger list changes
  triggerDomainChanges(message: boolean) {
    // Change the subject value
    this.domainChanged.next(message);
  }

    constructor(private http: HttpClient) {
    }

    getDomainById(id) {
        return this.http.get<Domain>('/bestinform/getDomainById?domainId=' + encodeURIComponent(id));
    }

    getListOfDomains(): Observable<Domain[]> {
        return this.http.get<Domain[]>('/bestinform/getListOfDomains');
    }

    updateDomain(domainId: string, domain: Domain){
        return this.http.post('/bestinform/updateDomain?domainId=' + domainId, domain);
    }

    changeResourceCategoryEnableForListStatus(resourceCategoryId: string, enableForList: boolean) {
        return this.http.put('/bestinform/changeResourceCategoryEnableForListStatus?resourceCategoryId=' + resourceCategoryId + '&enableForList=' + enableForList, {});
    }
}
