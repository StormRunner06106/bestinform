import { Component, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ForumService } from '../_services/forum.service';
import { ToastComponent } from 'src/app/theme/components/toast/toast.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-edit-thread',
  templateUrl: './edit-thread.component.html',
  styleUrls: ['./edit-thread.component.scss'],
  providers:[ToastComponent]
})
export class EditThreadComponent {
  private ngUnsubscribe=new Subject<void>();

  //form
  editThreadForm:FormGroup;

  //thread
  idThread:string;
  threadData:any;

  //tags
  addedTags=[];

  //wyziwyg
  htmlContent: string;
  editorConfig: AngularEditorConfig = {
      editable: true,
      height: '300',
      minHeight: '200px',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      enableToolbar: true,
      showToolbar: true,
      defaultParagraphSeparator: 'p',
      defaultFontName: 'Roboto',
      defaultFontSize: '',
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


  constructor(
    private forumService:ForumService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router:Router
  ){}

  ngOnInit():void{
    this.getPathId();
    this.initForm();
  }

  initForm(){
    this.editThreadForm= this.fb.group({
      title: ['', Validators.required],
      slug:['',Validators.required],
        category:['',Validators.required],
      status:['', Validators.required],
      tags:[['']],
      description:['']
    })
  }

  getPathId(){
    this.activatedRoute.params.subscribe(
      params=>{
        this.idThread=params['id'];
        this.getEditorialById(this.idThread);
      }
    );
  }

  getEditorialById(idThread){
    this.forumService.getThreadById(idThread)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (thread: any)=>{
        this.threadData=thread;
        this.addedTags=thread.tags;
        this.editThreadForm.patchValue({...this.threadData, tags: this.addedTags});

      }
    });
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  addTag(event: MatChipInputEvent): void {
      const value = (event.value || '').trim();

      // Add our tag
      if (value) {
          this.addedTags.push(value);
      }

      // Clear the input value
      event.chipInput.clear();
  }

  //remove tag
  remove(tag: string): void {
      const index = this.addedTags.indexOf(tag);

      if (index >= 0) {
          this.addedTags.splice(index, 1);
      }
  }

  updateThread(updatedThread){
    this.forumService.updateThread(this.idThread, updatedThread)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res :{success:boolean, reason:string}) =>{
        this.toastService.showToast("Success", "Topicul a fost updatat cu succes!", "success");
        this.router.navigate(['../../'], {relativeTo: this.activatedRoute})
      },
      error: (err:any)=>{
        console.log(err);
        this.toastService.showToast("Error", "Topicul a fost updatat cu succes!", "error");

      }
    })
  }

  //update thread
  saveThread(){
    const updatedThread={
      ...this.editThreadForm.value,
      tags:this.addedTags
    }

    if (this.editThreadForm.valid){
      this.updateThread(updatedThread);
    }else{
      this.editThreadForm.markAllAsTouched();
    }
  }

  ngOnDestroy():void{
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
