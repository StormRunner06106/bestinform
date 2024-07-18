import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class EditorialsService {
  constructor(private http: HttpClient) {
  }

  baseApiUrl = "/bestinform/uploadEditorialImage";

  //udate the editorial
  updateEditorial(editorialId : string, editorial: object) {
    return this.http.put('/bestinform/updateEditorial?editorialId=' + editorialId, editorial);
  }

  //change editorial status
  changeEditorialStatus(editorialId : string, status : string) {
    return this.http.put('/bestinform/changeEditorialStatus?editorialId=' + editorialId + '&status=' + status, {});
  }

   // Returns an observable
   uploadEditorialImage(editorialId : string, file: Blob): Observable<unknown> {
    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append("file", file);

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseApiUrl + '?editorialId=' + editorialId, formData)

  }

   //create editorial
   addEditorial(editorial: object) {
    return this.http.post('/bestinform/addEditorial', editorial);
  }

  //get all editorials
  listEditorialFiltered(page: number, size: number, sort?: string | null, dir?: string | null, filterParams?: object) {
      return this.http.post('/bestinform/listEditorialFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filterParams);
  }

    //get editorial by slug
    getEditorialBySlug(slug: string) {
        return this.http.get('/bestinform/getEditorialBySlug?slug=' + slug);
      }

    //get editorial By Id
    getEditorialById(editorialId : string) {
        return this.http.get('/bestinform/getEditorialById?editorialId=' + editorialId );
    }

  //deletePaymentDocument
  deleteEditorialById(editorialId: string) {
    return this.http.delete('/bestinform/deleteEditorialById?editorialId=' + editorialId );
  }

  getUserById(userId :string){
    return this.http.get("/bestinform/getUserById?userId="+ userId );
  }

  getCurrentUser(){
    return this.http.get("/bestinform/getCurrentUser");
  }

  getEditorialCategories(){
      return this.http.get('/bestinform/getEditorialCategories');
  }

  getEditorialCategoriesById(id: string){
      return this.http.get('/bestinform/getEditorialCategoryById?categoryId=' + id);
  }

  getEditorialSubcategoriesByCategoryId(id: string){
      return this.http.get('/bestinform/getEditorialSubcategoriesForCategory?categoryId='+ id);
  }
}
