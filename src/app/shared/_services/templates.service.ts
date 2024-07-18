import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class TemplatesService {

    constructor(private http: HttpClient) {
    }

    // --------------------------------------TEMPLATES---------------------------------

    listResourceTemplateFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/listResourceTemplateFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    getCategoryById(id: string) {
        const idArray = [id];
        return this.http.post('/bestinform/getResourceCategories', idArray);
    }

    getResourceTypeById(id: string) {
        const idArray = [id];
        return this.http.get('/bestinform/getResourceTypeById?resourceTypeId=' + id);
    }

    addTemplate(template) {
        return this.http.post('/bestinform/createResourceTemplate', template);
    }

    getTemplateById(id: string) {
        return this.http.get('/bestinform/getResourceTemplateById?resourceTemplateId=' + id);
    }

    deleteTemplate(id: string) {
        return this.http.delete('/bestinform/deleteResourceTemplate?resourceTemplateId=' + id);
    }

    updateTemplate(id: string, template) {
        return this.http.put('/bestinform/updateResourceTemplate?resourceTemplateId=' + id, template)
    }

    existsResourceForTemplate(resourceTemplateId : string) {
        return this.http.get('/bestinform/existsResourceForTemplate?resourceTemplateId=' + resourceTemplateId);
    }

    checkResourceTypeForTemplate(body: string[], resourceTemplateId?: string) {
        return this.http.post<Array<{resourceTypeId?: string; resourceTypeName?: string;}>>('/bestinform/checkResourceTypeForTemplate?resourceTemplateId='+resourceTemplateId, body);
    }

    // --------------------------------ATTRIBUTE CATEG----------------------------------


    getCategoryList(page: number, size: number, sort?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/getCategoryList?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);

    }

    getAttributeCategoryById(id: string) {
        return this.http.get('/bestinform/getCategoryById?categoryId=' + id);

    }

    updateAttributeCategory(id: string, category: object){
        return this.http.put('/bestinform/updateCategory?categoryId=' + id, category);
    }

    addAttributeCategory(category: object) {
        return this.http.post('/bestinform/addCategory', category);
    }

    deleteAttributeCategory(id: string){
        return this.http.delete('/bestinform/deleteCategory?categoryId=' + id);
    }

    // --------------------------------- ATTRIBUTES ------------------------------------
    listAttributesFiltered(page: number, size: number, sort?: string, sort2?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/listAttributesFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&sort2=' + sort2 + '&dir=' + dir, filters);
    }

    getMaxOrderByCategory(categoryId: string){
        return this.http.get('/bestinform/getAttributeMaxOrderByCategoryId?categoryId='+ categoryId);
    }

    changeAttributeOrder(attributeId: string, order: number){
        return this.http.put('/bestinform/changeAttributeOrder?attributeId=' + attributeId + '&order=' + order, {});
    }

    getAttributeById(attributeId: string) {
        return this.http.get('/bestinform/getAttributeById?attributeId=' + attributeId);
    }

    addAttribute(attribute: object){
        return this.http.post('/bestinform/addAttribute', attribute);
    }

    updateAttribute(attributeId: string, attribute: object){
        return this.http.put('/bestinform/updateAttribute?attributeId='+ attributeId, attribute);
    }

    deleteAttribute(attributeId: string){
        return this.http.delete('/bestinform/deleteAttribute?attributeId='+ attributeId);
    }

    getResourceTypes(){
        return this.http.get('/bestinform/getAllResourceTypes');
    }

}
