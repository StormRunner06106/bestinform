import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class JobService {

    constructor(private http: HttpClient) {
    }

    getResourceTypesByDomainId(domainId: string) {
        return this.http.get('/bestinform/getResourceTypesByDomainId?domainId=' + domainId);
    }

    getListOfDomains() {
        return this.http.get('/bestinform/getListOfDomains');
    }

    getListTemplateFiltered(page: number, size: number, sort?: string, dir?: string, filters?) {
        return this.http.post('/bestinform/listResourceTemplateFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    getAttributesFromTemplate(templateId: string) {
        return this.http.get('/bestinform/getAttributesFromTemplate?resourceTemplateId=' + templateId);
    }


    //RESOURCE REQ
    addResource(data: any, userId?: string) {
        if (userId) {
            return this.http.post('/bestinform/addResource?userId=' + userId, data);
        } else {
            return this.http.post('/bestinform/addResource', data);
        }
    }

    updateResource(id: string, data: any) {
        return this.http.put('/bestinform/updateResource?resourceId=' + id, data)
    }

    getResourceById(id: string) {
        return this.http.get('/bestinform/getResourceById?resourceId=' + id)
    }


    uploadResourceImage(resourceId: string, file: object) {
        return this.http.post('/bestinform/uploadResourceImage?resourceId=' + resourceId, file);
    }

    getCandidates(resourceId: string) {
        return this.http.get('/bestinform/getUserListJobApplication?resourceId=' + resourceId);
    }

    getListCvFilteredpage(page: number, size: number, sort?: string, dir?: string, filters?) {
        return this.http.post('/bestinform/listCVFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    deleteJob(resourceId: string) {
        return this.http.delete('/bestinform/deleteResource?resourceId=' + resourceId);
    }

    deleteCvById(cvId: string) {
        return this.http.delete('/bestinform/deleteCvById?cvId=' + cvId);
    }
}
