import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";
import {User} from "../../../../shared/_models/user.model";

@Injectable({
    providedIn: 'root'
})
export class AttributesService {


    // Stepper
    // step$ = new BehaviorSubject(0);
    preferences$ = new BehaviorSubject([]);
    userData$ = new BehaviorSubject(undefined);

    constructor(private http: HttpClient) {
    }


    // /** Stepper Listener*/
    // getStep() {
    //     return this.step$.asObservable()
    // }

    listAttributesFiltered(pageNumber:number, pageSize: number, sort1?: string, sort2?: string, dir?: string, filters?){
        return this.http.post('/bestinform/listAttributesFiltered?page=' + pageNumber + '&size=' + pageSize + '&sort1=' + sort1 + '&sort2=' + sort2 + '&dir=' + dir, filters);

    }

    getCurrentUser(){
        return this.http.get('/bestinform/getCurrentUser');
    }

    updateCurrentUser(userData: User){
        return this.http.put('/bestinform/updateCurrentUser', userData);
    }

    executeRecurringPayments(){
        return this.http.post('/bestinform/executeRecurringPayments', {});
    }


}
