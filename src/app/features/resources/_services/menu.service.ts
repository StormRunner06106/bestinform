import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MenuService {


    refreshMenuList$ = new BehaviorSubject(false)
    menuList$ = new BehaviorSubject([])

    deleteArray$ = new BehaviorSubject([]);

    menuId$ = new BehaviorSubject(undefined);

    constructor(private http: HttpClient) {
    }

    refreshMenuListData() {
        return this.refreshMenuList$.asObservable()
    }

    menuListData() {
        return this.menuList$.asObservable();
    }

    addCategoryToList(categ) {
        this.menuList$.next(this.menuList$.getValue().concat(categ))
    }

    addCategoryToDeleteArray(categ) {
        this.deleteArray$.next(this.deleteArray$.getValue().concat(categ));
    }

    //req
    createMenu(resourceId: string, menu) {
        return this.http.post('/bestinform/createResourceMenu?resourceId=' + resourceId, menu);
    }

    getMenuById(menuId: string) {
        return this.http.get('/bestinform/getMenuById?menuId=' + menuId);
    }

    getMenuByResourceId(resourceId: string) {
        return this.http.get('/bestinform/getResourceMenu?resourceId=' + resourceId);
    }

    updateMenu(menuId: string, menu){
        return this.http.put('/bestinform/updateMenu?menuId=' + menuId, menu);
    }
}