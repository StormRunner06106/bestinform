import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private http: HttpClient) { }

  listUsersFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
    return this.http.post('/bestinform/listUsersFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
  }

  getUserById(userId: string) {
    return this.http.get('/bestinform/getUserById?userId=' + userId);
  }

  updateUser(userId: string, userObj: object) {
    return this.http.put('/bestinform/updateUser?userId=' + userId, userObj);
  }

  addUser(userObj: object) {
    return this.http.post('/bestinform/addUser', userObj);
  }

  deleteUser(userId: string) {
    return this.http.delete('/bestinform/deleteUser?userId=' + userId);
  }

  changeUserPassword(userId: string, password: string) {
    return this.http.put('/bestinform/changeUserPassword?userId=' + userId, password);
  }

  changeActiveStatus(targetUserId : string, accept : boolean){
    return this.http.put('/bestinform/changeActiveStatus?targetUserId=' + targetUserId + '&accept=' + accept, {});
  }

  changeBlockStatus(userId  : string, block : boolean){
    return this.http.put('/bestinform/changeBlockStatus?userId=' + userId  + '&block=' + block, {});
  }

  sendRegistrationEmail(userId: string) {
    return this.http.get('/bestinform/sendRegistrationEmail?userId=' + userId);
  }

}
