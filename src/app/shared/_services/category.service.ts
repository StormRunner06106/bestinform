import { HttpClient} from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class AuthService{

    constructor(
        public http:HttpClient,
    ){}

//attribute-category-controller
    //update category
    updateAttributeCategory(categoryId: string, name: string) {
    return this.http.put('/bestinform/updateCategory?categoryId=' + categoryId, name);
    }

    addAttributeCategory(name : string) {
    return this.http.post('/bestinform/addCategory', name );
    }

    getAtributteCategoryList() {
        return this.http.get('/bestinform/getCategoryList');
      }


}
