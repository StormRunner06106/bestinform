import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

  export class MessagesConversationsService {

  // Functions For Changes Detection
  private listChanged = new BehaviorSubject(false);
  listChangedObs = this.listChanged.asObservable();

  triggerListChanges(message: boolean) {

    // Change the subject value
    this.listChanged.next(message);
  }

    constructor(private http: HttpClient) { }

  //CONVERSATIONS

    //update conversation
    updateConversation(conversationId : string, conversationObj: object){
      return this.http.put("/bestinform/updateConversation?conversationId=" + conversationId, conversationObj);
    }

    //remove user from conversation
    removeUserFromConversation(conversationId :string, userId:string){
      return this.http.post("/bestinform/removeUserFromConversation?conversationId=" + conversationId + "&userId=" + userId, {});
    }

    //leave conversation
    leaveConversation(conversationId:string){
      return this.http.post("/bestinform/leaveConversation?conversationId=" + conversationId, {});
    }

    //create new conversation
    createConversation(category: string, name: string){
      return this.http.post("/bestinform/createConversation?category=" + category + '&name=' + name,[]);
    }

    //add user to conversation
    addUserToConversation(conversationId: string, userId:string){
      return this.http.post("/bestinform/addUserToConversation?conversationId=" + conversationId + "&userId=" + userId,{});
    }

    //get conversation by Id
    getConversationById(conversationId: string){
      return this.http.get("/bestinform/getConversationById?conversationId=" + conversationId );
   }

    //list conversation filter
    listConversationFiltered(category: string, page: number, size: number, sort?: string, dir?: string) {
    return this.http.post('/bestinform/listConversationFiltered?category='+ category + '&page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir,{} );
  }

    //list Bestinorm conversation filter
    listBestinformConversationFiltered(page: number, size: number, sort?: string, dir?: string,  filters?: object) {
      return this.http.post('/bestinform/listBestinformConversationFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    //MESSAGES

      //send message
      sendMessage(conversationId:string, messageObj?: object) {
      return this.http.post('/bestinform/sendMessage?conversationId='+ conversationId, messageObj);
    }

    //list message filter
    listMessageFiltered(conversationId:string, page: number, size: number, sort?: string, dir?: string,  filters?: object) {
      return this.http.post('/bestinform/listMessageFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir + '&conversationId='+ conversationId , filters);
    }

    //get message by id
    getMessageById(messageId:string){
      return this.http.get('/bestinform/getMessageById?messageId='+ messageId);
    }

    //delete message
    deleteMessage(messageId :string){
      return this.http.delete("/bestinform/deleteMessage?messageId=" + messageId);
    }
  }
