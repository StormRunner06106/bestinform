import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Resource} from "../_models/resource.model";
import {response} from "express";
import {GenericPagination} from "../_models/generic-pagination.model";

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  // private headerOptions = { headers: new HttpHeaders().set('Content-Type', 'multipart/form-data') };

  constructor(private http: HttpClient) { }

  listResourceFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
    return this.http.post<GenericPagination<Resource>>('/bestinform/listResourceFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters ? filters : {});
  }

  // addResource(resourceObj) {
  //   return this.http.post('/bestinform/addResource', resourceObj);
  // }

  addResource(data: any, userId?: string) {
    if (userId) {
      return this.http.post('/bestinform/addResource?userId=' + userId, data);
    } else {
      return this.http.post('/bestinform/addResource', data);
    }
  }

  updateResource(resourceId: string, resourceObj) {
    return this.http.put('/bestinform/updateResource?resourceId=' + resourceId, resourceObj);
  }

  getResourceById(resourceId: string) {
    return this.http.get('/bestinform/getResourceById?resourceId=' + resourceId);
  }

  getResourceBySlug(resourceSlug: string){
    return this.http.get('/bestinform/getResourceBySlug?slug=' + resourceSlug);
  }

  uploadResourceImage(resourceId: string, file: object) {
    return this.http.post('/bestinform/uploadResourceImage?resourceId=' + resourceId, file);
  }

  uploadDocAttachements(resourceId: string, type: string, file: object) {
    return this.http.post('/bestinform/uploadDocAttachments?resourceId=' + resourceId + '&type=' + type, file);
  }

  deleteResource(resourceId: string) {
    return this.http.delete('/bestinform/deleteResource?resourceId=' + resourceId);
  }

  changeResourceStatus(resourceId: string, status: string){
    return this.http.put('/bestinform/changeResourceStatus?resourceId=' + resourceId + '&status=' + status, {});
  }

  addRelatedresources(targetResourceId: string, eventId: string){
    return this.http.put('/bestinform/addRelatedResource?targetResourceId='+targetResourceId+'&eventId='+eventId, {});
  }

  removeRelatedResource(eventId: string, targetResourceId: string){
    return this.http.put('/bestinform/removeRelatedResource?eventId='+ eventId+'&targetResourceId=' + targetResourceId, {});
  }

  deleteResourceFeatureImage(resourceId: string) {
    return this.http.delete('/bestinform/deleteResourceFeatureImage?resourceId=' + resourceId);
  }

  createResourceNotification(resourceId: string) {
    return this.http.post('/bestinform/createResourceNotification?resourceId=' + resourceId, {});

  }
}
