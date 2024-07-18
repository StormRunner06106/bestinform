import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Route } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ForumService } from '../_services/forum.service';
import { Subject, take, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { UserDataService } from 'src/app/shared/_services/userData.service';

@Component({
  selector: 'app-view-topic',
  templateUrl: './view-topic.component.html',
  styleUrls: ['./view-topic.component.scss'],
  providers: [DatePipe]
})
export class ViewTopicComponent {

  // MatPaginator Output
  pageEvent: PageEvent;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private ngUnsubscribe = new Subject<void>();


  //thread data
  threadId:string;
  threadData:any;

  //current user data
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;

  //comments data
  listThreadComments=[];
  
  // Mat Table - pagination, sorting, filtering
  page = 0;
  sorting = "date";
  dir = 'desc';
  pageSize= 10;
  totalElements: number;
  pageItems=[10,20,50,100];


  //wyziwyg
  htmlContent: string;
  editorConfig: AngularEditorConfig = {
      editable: true,
      height: '200',
      minHeight: '200px',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      enableToolbar: true,
      showToolbar: true,
      defaultParagraphSeparator: 'p',
      defaultFontName: '',
      defaultFontSize: '5',
      fonts: [
          {class: 'arial', name: 'Arial'},
          {class: 'times-new-roman', name: 'Times New Roman'},
      ],
      customClasses: [
          {
              name: 'Title',
              class: 'format-title'
          },
          {
              name: 'Paragraph',
              class: 'format-paragraph'
          }

      ],
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
          ['subscript'],
          ['superscript'],
          ['backgroundColor']
      ]
  };

  newCommentForm= new FormControl('');

  constructor(
    private route:ActivatedRoute,
    private forumService:ForumService,
    private userService: UserDataService
  ){}

  ngOnInit():void{
    this.getCurrentUser();
    this.getPathTrhreadId();
    this.listChanges();
  }

  getCurrentUser(){
    this.userService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (user:any)=>{
        this.currentUserId=user.id;
        this.currentUserName=user.firstName+' '+user.lastName;
        this.currentUserAvatar=user.avatar !== null ? user.avatar.filePath : '../../../../assets/images/others/user.jpg';
      }
    });
  }

  getPathTrhreadId(){
    this.route.params.subscribe(params => {
      this.threadId = params['id'];
      //thread data
      this.getThreadById(this.threadId);
      //comments list
      this.getListThreadComments();
    });
  }

  getThreadById(id){
    this.forumService.getThreadById(id)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({ 
      next: (threadData:any)=>{
        this.threadData=threadData;

        console.log('datele forumului', this.threadData);
    }
  });
  }

  getListThreadComments(){
    this.forumService.listThreadComments(this.threadId, this.page, this.pageSize, this.sorting, this.dir, false)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (commentsObj:any)=>{
        this.listThreadComments=commentsObj.content;
        this.totalElements=commentsObj.totalElements;
      }
    });
  }

  addComment(){
    const comment=this.newCommentForm.value;
    // this.nrWords=this.wordCount(comment) -1;

    this.forumService.addCommentToThread(this.threadId, comment)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res: {success: boolean, reason: string})=>{
        console.log(res);
        this.forumService.triggerUserListChanges(true);
      }

    });
  }

  // Listen to data changes and refresh the user list
  listChanges() {
    this.forumService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getListThreadComments();
      }

    })
    this.forumService.triggerUserListChanges(false);

  }

  goTo(element: HTMLElement) {
    element.scrollIntoView();
  }



  likeComment(commentId){
    this.forumService.addLikeToThreadComment(commentId, true)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res: {success: boolean,reason: string})=>{
        console.log(res);
      }
    });
  }


  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Documents List
    this.getListThreadComments();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}
}
