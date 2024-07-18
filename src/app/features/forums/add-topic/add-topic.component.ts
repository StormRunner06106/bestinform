import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ForumService } from '../_services/forum.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import {MatIconModule} from '@angular/material/icon';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { error } from 'console';



@Component({
  selector: 'app-add-topic',
  templateUrl: './add-topic.component.html',
  styleUrls: ['./add-topic.component.scss'],

})
export class AddTopicComponent {

private ngUnsubscribe = new Subject<void>();
threadId:string;

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

  addTopicForm: FormGroup;
  // featuredImageForm:FormControl;

  //tags
  addedTags=[];

  //slug
  slugSuggestion:string;
  categorySlug:string;

  //featured image
      // images url and files
      thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    thumbnailFile: Blob;
    trueFile=false;

  constructor(
    private fb:FormBuilder,
    private forumService: ForumService,
    private activatedRoute: ActivatedRoute,
    private router:Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ){}

  ngOnInit():void {
    this.getPathSlug();
    this.initForm();
  }

  initForm(){
    this.addTopicForm= this.fb.group({
      title: ['', [Validators.required]],
      category: [''],
      description: ['', [Validators.required]],
      slug: [''],
      status: ['pending_review'],
      tags: [['']]
    });

    // this.featuredImageForm=new FormControl('');
  }

  //get the editorial slug from url
  getPathSlug() {
    this.activatedRoute.params.subscribe(params => {
        this.categorySlug = params['category'];
    });
  }

  //create slug suggestion
  createSlug(title: string) {
    const insertedTitle = title.toLocaleLowerCase();
    this.slugSuggestion = insertedTitle.split(' ').join('-');
    console.log(this.slugSuggestion);
    this.addTopicForm.get("slug").patchValue(this.slugSuggestion);
    this.cdr.detectChanges();
  }

  //add tags
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

  //featured image
  onThumbnailChange(event) {
    if (event.target.files && event.target.files[0]) {
      const maxSize = 2 * 1024 * 1024;
      if (event.target.files[0].size < maxSize) {
        this.trueFile=true;
        this.thumbnailUrl.fileName = event.target.files[0].name;
        this.thumbnailFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => this.thumbnailUrl.filePath = reader.result;
        reader.readAsDataURL(this.thumbnailFile);
      }else{
        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
        return;
      }
    }
  }

  removeThumbnail() {
      this.thumbnailUrl = {
          fileName: undefined,
          filePath: undefined
      };
      this.thumbnailFile = undefined;
  }

  createThread(topicObj){
    this.forumService.createForumThread(topicObj)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: ( res:{success: boolean, reason: string})=>{
        this.toastService.showToast("Info", "Topicul a fost creat! Urmează să fie aprobat de către staff.", "info")

        if(res.success === true){
          //add featured image
          if(this.thumbnailFile !== undefined){
            const thumbnailData = new FormData();
            thumbnailData.append('file', this.thumbnailFile);

            this.forumService.uploadForumImage(res.reason, thumbnailData)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: ((imgRes: {success: boolean, reason: string})=>{

              this.toastService.showToast("Success", "Imaginea a fost incarcata!", "success")

                  this.router.navigate(['../'], {relativeTo: this.activatedRoute})

              }),
             error: (error:any)=>{
              console.log(error);
                // this.toastService.showToast("Error", "Incarcati o imagine reprezentativa!", "error")
                if(error.error.reason === 'fileSizeTooBig'){
                  this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
              } else if(error.error.reason === 'wrongExtension'){
                  this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
              }else{
                  this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
              }
            }

          })
        }else{
              this.router.navigate(['../'], {relativeTo: this.activatedRoute})
              return;
        }
        }
      },
      error: (err)=>{
        console.log(err);
        this.toastService.showToast("Error", "A aparut o eroare!", "error")
      }
    });
  }


  //save
  saveTopic(){


      const topicObj={
        ...this.addTopicForm.value,
        tags: this.addedTags,
        category:this.categorySlug
      }



    console.log(topicObj);

    // Check if the form is valid
    if (this.addTopicForm.valid) {
      // Check if you have a user ID

          // Create user
          this.createThread(topicObj);

    } else {
      // Mark all inputs as touched
      this.addTopicForm.markAllAsTouched();
  }


  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}
