import { Component, Input } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { Subject, takeUntil } from 'rxjs';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { User } from 'src/app/shared/_models/user.model';
import { DatePipe } from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

export type Message = {
  text?: string,
  attachments?: Array<{
      fileName?: string;
      filePath?: string;
  }>;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,MatTooltipModule ],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})


export class ConversationComponent {

  @Input() conversationID:string;



  private ngUnsubscribe = new Subject<void>();
  sendMessageForm=new FormControl('', [Validators.required, this.noWhitespaceValidator()]);
  messageToSend:Message={};

  //list of messages
  messageList:Array<any>=[];
  userData:User;
  currentUserId:string;

  //before this, hr-today divider
  setTodayArray:Array<any>=[];
  today = new Date();
  isTodayMsg=false;

  //get conversation id from reservation
  reservationId:string;
  conversationId:string; //641d9c5641916e57e2b59b05
  reservation:Reservation; //641d9c5641916e57e2b59b06

  conversationData:any;
  nameUser:string;
  userFromMessage:string;

  constructor(private formBuilder: FormBuilder,
    private conversationsServices:MessagesConversationsService,
    private usersService: UserDataService,
    private scroller: ViewportScroller,
    private datePipe: DatePipe,
              private sanitizer: DomSanitizer){}

    ngOnInit(): void {
    this.initData();
  }

  initData(){
    console.log('id conversatie',this.conversationID);
    this.getCurrentUser();
    this.getIdConversation();
  }

  makeLinksClickable(text: string): SafeHtml {
    // Regular expression to match URLs with or without http/https prefix
    const urlRegex = /((http(s)?:\/\/)|(www\.))[^\s]+/g;

    // Replace URLs with anchor tags
    const linkedText = text.replace(urlRegex, (url) => {
      // Check if the URL starts with "www." and add "http://" if not
      if (url.startsWith("www.")) {
        url = "https://" + url;
      }

      return `<a href="${url}" class="message-link" target="_blank">${url}</a>`;
    });

    // Sanitize the HTML to prevent security issues
    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }

  // Function to process messages and add hyperlinks
  processMessages(messages: any[]): any[] {
    return messages.map((message) => {
      return {
        ...message,
        text: this.makeLinksClickable(message.text)
      };
    });
  }

  get processedMessages() {
    return this.processMessages(this.messageList);
  }

  isLink(text: string): boolean {
    // Regular expression to match URLs with or without http/https prefix
    const urlRegex = /((https?:\/\/)|(www\.[^\s]+))/g;

    // Test if the text contains a match to the URL regex
    return urlRegex.test(text);
  }

  //get current user data for message list
  getCurrentUser(){
    this.usersService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (user:User)=>{
        console.log('USERUL MEU',user);
        this.userData=user;
        this.currentUserId=this.userData.id;
        if(this.currentUserId){
          this.getIdConversation()
        }
      }
    });
  }

   // Listen to data changes and refresh the user list
 listChanges() {

  this.conversationsServices.triggerListChanges(true);
  this.getMessagesList();
}

  //get id conversation from reservation
  getIdConversation(){
    this.conversationId=this.conversationID;
    this.getConversationById(this.conversationID);
    if(this.conversationId){
      this.getMessagesList();
    }
  }

  getConversationById(idConv){
    this.conversationsServices.getConversationById(idConv)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: conversation =>{
        this.conversationData=conversation;
      }
    });
  }

  //
  // checkToday(date:any){
  //   const today=this.datePipe.transform(this.today, 'dd/MM/YYYY');
  //   const msgDate= this.datePipe.transform(date, 'dd/MM/YYYY');

  //   this.isTodayMsg = (today === msgDate) ? true : false;
  //   return;
  // }

  sendMessage(){
    //tratam daca cumva trebuie adaugate si atasamente

    if (this.sendMessageForm.valid) {
      this.messageToSend.text=this.sendMessageForm.value;
      console.log(this.messageToSend);

      //if the message is not null
      if(this.messageToSend.text !== ''){
        this.conversationsServices.sendMessage(this.conversationId, this.messageToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: res=>{
                this.sendMessageForm.reset();
                this.listChanges();

                //this.getMessagesList();
                console.log('s-a trimis:', res, this.conversationId, this.messageToSend);
              },
              error: error=>{
                console.log('nu s-a trimis:', error, this.conversationId, this.messageToSend);
              }
            });
      } else {
        console.log('invalid message')
      }
    }


  }


  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && value.trim().length === 0) {
        return { noWhitespace: true };
      }
      return null;
    };
  }

    getMessagesList(){
      const filters={
        // userId: ,
        // text: ''
      }
      this.conversationsServices.listMessageFiltered(this.conversationID,0 ,-1 ,'date', 'asc', filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res:any)=>{

          this.messageList=res.content;
          console.log(this.messageList);

        }
      });
    }

  getUserById(id){
    this.usersService.getUserById(id)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (user:User)=>{
        this.nameUser=user?.lastName+ ' '+user?.firstName+': ';
        }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
