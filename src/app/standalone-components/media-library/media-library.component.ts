import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from 'src/app/shared/_services/media.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TemplatesService } from 'src/app/shared/_services/templates.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from "../../shared/_services/toast.service";
// import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
// import {MatLegacyInputModule} from "@angular/material/legacy-input";
// import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';

export interface SingleMedia {
  id?: string;
  name?: string;
  category: string;
  alternativeName: string;
  path: string;
  size?: number;
  userId?: string;
  fileType?:string;
  date?:string;
  status?:string;
}

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [        CommonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule],
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss'],
})
export class MediaLibraryComponent implements OnInit, OnDestroy{

  //to close the subscribe, saving time
  private ngUnsubscribe= new Subject<void>();

  //pagination
  page:number;
  size:number;
  sort="date";
  dir="desc";

  //img data
  mediaId:string;
  mediaPath:string;
  mediaCategory:string
  mediaName:string;
  mediaAlternativeName:string;
  mediaSize:number;
  mediaType:string;

  categoryMediaList=['image', 'pdf', 'document', 'other']

  //get all media for galery
  filteredMedia=[];
  //total number of media
  allMedia:number;

  singleMedia: any;

   //upload file
   selectedFiles = [];

   imgMessage:string;
   imagePath: string;
   urlfeaturedImg: string | ArrayBuffer = '/assets/images/others/Showcase.jpg';
   uploadedImageEvent: Blob
   nameFeaturedImg: Blob;
   selectedFile = Blob;

  mediaForm = this.formBuider.group({
    // id: new FormControl(''),
    alternativeName: new FormControl(''),
    category: new FormControl(''),
    // date: new FormControl(''),
    name: new FormControl( '', Validators.required),
    // path: new FormControl(''),
    // size: new FormControl(null),
    // userId: new FormControl('')
  });

  searchMediaFilter: FormControl = new FormControl('');
  categoryMediaFilter:FormControl=new FormControl<string>('');
  
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
    private unsubscribe: Subscription[] = [];


  constructor(
    private mediaService:MediaService,
    private templateService:TemplatesService,
    private cdr:ChangeDetectorRef,
    private modalService: NgbModal,
    private formBuider:FormBuilder,
    private toastService: ToastService
  ){
    const loadingSubscr = this.isLoading$
            .asObservable()
            .subscribe((res) => (this.isLoading = res));
        this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(){
    this.page=0;
    this.size=18;

    this.getMediaList();
    console.log("valoare filtru ",this.searchMediaFilter.value.alternativeNamet);
  }


//display all media
  getMediaList(){

    const filter={
      name:  !this.searchMediaFilter.value ? null : this.searchMediaFilter.value,
      category: !this.categoryMediaFilter.value ? null : this.categoryMediaFilter.value
    }

    console.log(filter);

    this.mediaService.listMediaFiltered(this.page, this.size, this.sort, this.dir, filter)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(mediaData:any)=>{
        this.filteredMedia=mediaData.content;
        this.allMedia = mediaData.totalElements;
        // console.log("all media", this.filteredMedia);
        this.cdr.detectChanges();
      }
      });
  }

  loadForm(mediaId: string) {
    this.mediaService.getMediaById(mediaId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (mediaByIdData:any)=>{
        console.log(mediaByIdData);
        console.log(mediaByIdData.alternativeName,mediaByIdData.category);
          this.mediaId=mediaByIdData.id;
          this.mediaCategory=mediaByIdData.category;
          this.mediaName=mediaByIdData.name;
          this.mediaAlternativeName=mediaByIdData.alternativeName;
          this.mediaPath=mediaByIdData.path;
          this.mediaCategory=mediaByIdData.category;
          this.mediaForm.patchValue(mediaByIdData);
      }
    });
  }


  onImgChanged(event: any) {
    console.log('on img changed');
    this.isLoading$.next(true);

    this.selectedFiles = event.target.files;
    this.cdr.detectChanges();
    this.addMedia();
  }

  addMedia() {
    // this.isLoading = true;
    if (this.selectedFiles.length > 0) {
      this.mediaService.addMedia().subscribe((resp: any) => {
        console.log(resp);
        this.mediaId = resp.reason;
        this.uploadFile(this.mediaId);
        this.isLoading$.next(false);

        this.toastService.showToast("Succes", "Fișierul a fost încărcat cu succes.", "success");

      })
    }
  }

  uploadFile(solutionId: string) {
    if (this.selectedFiles.length > 0) {
      const formData: FormData = new FormData();
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('file', this.selectedFiles[i])
        
      }
      this.mediaService.uploadMedia(solutionId, formData)
        .subscribe(res => {
          this.toastService.showToast("Succes", "Fișierul a fost încărcat cu succes.", "success");

          this.getMediaList();
        }, error => {
          console.log('nu s-a incarcat', error);
          if(error.error.reason === 'fileSizeTooBig') {
            this.toastService.showToast('Error', 'Fișierul încărcat este prea mare. Trebuie să aibă maxim 2MB.', "error");
          } else if(error.error.reason === 'wrongExtension') {
            this.toastService.showToast('Error', 'Acest format de fisier nu este permis!', "error");
          } else {
            this.toastService.showToast('Error', 'Fișierul NU a fost încărcat!', "error");
          }
        });
    }
  }



//   onImgChanged(event:any){
//     console.log(event);
//     const files = event.target.files;
//     if (files.length === 0)
//         return;

//     //read the image
//     const reader = new FileReader();
//     this.imagePath = files;
//     console.log("imaginea incarcata, imagePath:", this.imagePath);

//     //get image
//     this.uploadedImageEvent=event.target.files[0];

//     // this.mediaName=this.uploadedImageEvent.name;
//     // // this.mediaAlternativeName=this.mediaForm.value.alternativeName;
//     // this.mediaType=this.uploadedImageEvent.type==="text/plain" ? "document" : this.uploadedImageEvent.type==="image/png" ? "image" : "other";

//     // this.mediaForm.get('name').patchValue(this.mediaName);
//     // // this.mediaForm.get('alternativeName').patchValue(this.mediaAlternativeName);
//     // this.mediaForm.get('category').patchValue(this.mediaType);



//     reader.readAsDataURL(files[0]);
//       this.nameFeaturedImg=files[0].name;
//       reader.onload = () => {
//       //new image link
//       this.urlfeaturedImg = reader.result;
//       this.cdr.detectChanges();
//   }
// }
//???????????????????
  // addMedia(){
  // if(this.imagePath.length > 0){
  //   this.mediaService.addMedia()
  // .pipe(takeUntil(this.ngUnsubscribe))
  // .subscribe({
  //   next: (newFile:{success:boolean, reason:string})=>{
  //     console.log(newFile.reason);
  //     console.log(this.imagePath);
  //     this.uploadMedia(newFile.reason, this.imagePath);
  //   }
  // })

  // }
  // else{
  //   return;
  // }
  // }

  //edit media
  editMedia(mediaId){
    const updatedMediaData={
      name: this.mediaForm.value.name,
      alternativeName: this.mediaForm.value.alternativeName,
      category: this.mediaForm.value.category,
    }

    this.mediaService.updateMedia(mediaId, updatedMediaData)
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe({
    next: (data:any)=>{
      console.log(data);
      this.toastService.showToast('Success', 'Fișierul modificat cu succes!', "success");

    }
  })
}

  uploadMedia(idMedia,file){

    this.mediaService.uploadMedia(idMedia,file)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(response:any)=>{
        console.log("fisier incarcat cu succes",response);

      },
      error: error=>{
        console.log('nu s-a incarcat:', error);
        if(error.error.reason === 'fileSizeTooBig') {
          this.toastService.showToast('Error', 'Fișierul încărcat este prea mare. Trebuie să aibă maxim 2MB.', "error");
        } else {
          this.toastService.showToast('Error', 'Fișierul NU a fost încărcat!', "error");
        }
      }
    })
  }


  beforeDismiss() {
    this.singleMedia = {};
    return true;
  }

  openAddFileModal(content: any) {
    this.modalService.open(content, {centered: true, size: 'lg',  beforeDismiss: this.beforeDismiss  });

  }

  openEditModal(content: any, media: any) {
    this.modalService.open(content, {centered: true, size: 'lg',  beforeDismiss: this.beforeDismiss  });
    console.log(media);
    if(media.id){
      this.loadForm(media.id);
    }
  }

  //pagination
  getServerData($event: any) {
    this.page=$event.pageIndex;
    this.size=$event.pageSize;

    this.getMediaList();
  }

  // //delete image
  deleteMedia(mediaId: string) {
    console.log("am intrat in functia de delete si stergem id-ul: ",mediaId);
    this.mediaService.deleteMediaById(mediaId).subscribe(resp => {
      console.log(resp);
      this.getMediaList();
      setTimeout(() => {
        this.modalService.dismissAll();
      }, 1000);
    });
  }
  //delete modal
  openDeleteModal(content: any, media: any) {
    this.modalService.open(content, {centered: true, size: 'lg',  beforeDismiss: this.beforeDismiss  });
    this.mediaId=media.id;
  }

  imgPreviewModal(content: any, media: any) {
    this.modalService.open(content, {centered: true, size: 'lg',  beforeDismiss: this.beforeDismiss  });
    this.mediaId=media.id;
    this.mediaPath=media.path;
    this.mediaAlternativeName=media.alternativeName;

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
