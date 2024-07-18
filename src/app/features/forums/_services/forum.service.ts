import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ForumService {

      // Functions For Changes Detection
  private listChanged = new BehaviorSubject(false);
  listChangedObs = this.listChanged.asObservable();

  // Trigger list changes
  triggerUserListChanges(message: boolean) {
    // Change the subject value
    this.listChanged.next(message);
  }
  
    constructor(private http: HttpClient) {}

    listForumThreadFiltered(page: number, size: number, sort?: string | null, dir?: string | null, filterParams?: object) {
        return this.http.post('/bestinform/listForumThreadFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filterParams);
    }

    changeThreadStatus(threadId : string, status: string) {
        return this.http.put('/bestinform/changeThreadStatus?threadId=' + threadId + '&status=' + status, {});
    }

    getThreadById(threadId : string) {
        return this.http.get('/bestinform/getThreadById?threadId=' + threadId);
    }

    createForumThread(forumObj?: object){
        return this.http.post('/bestinform/createForumThread',forumObj);
    }

    uploadForumImage(threadId: string, file: object) {
        return this.http.post('/bestinform/uploadForumImage?threadId=' + threadId , file);
    }

    updateThread(threadId : string, threadObj: any) {
        return this.http.put('/bestinform/updateThread?threadId=' + threadId , threadObj);
    }

    //thread comments
    listThreadComments(threadId: string, page: number, size: number, sort?: string | null, dir?: string | null, disable?: boolean) {
        return this.http.post('/bestinform/listThreadComments?threadId='+ threadId +'&page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir + '&disable='+ disable, {});
    }

    listAllThreadComments(threadId: string, page: number, size: number, sort?: string | null, dir?: string | null) {
        return this.http.post('/bestinform/listThreadComments?threadId='+ threadId +'&page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, {});
    }

    addLikeToThreadComment(commentId: string, like: boolean) {
        return this.http.put('/bestinform/addLikeToThreadComment?commentId=' + commentId + '&like=' + like, {});
    }

    addCommentToThread(threadId : string, comment: string) {
        return this.http.post('/bestinform/addCommentToThread?threadId=' + threadId, comment);
    }

    disableThreadComment(commentId: string, disable: boolean) {
        return this.http.put('/bestinform/disableThreadComment?commentId=' + commentId + '&disable=' + disable, {});
    }

}
