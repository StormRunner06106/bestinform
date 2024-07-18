import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {User} from "../../../../shared/_models/user.model";
import {ToastService} from "../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss']
})
export class ClientProfileComponent implements OnInit {

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    // cover img url and files
    coverClientUrl = {
      fileName: undefined,
      filePath: undefined
    };
    coverClientFile: Blob;

    //avatar img url and files
    avatarClientUrl = {
      fileName: undefined,
      filePath: undefined
    };
    avatarClientFile: Blob;

    //user data
    currentUserData: User;

  constructor( private userData: UserDataService,
    private cdr: ChangeDetectorRef,
               private toastService: ToastService,
               private translate: TranslateService
    ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    }

  getCurrentUser(){
    this.userData.getCurrentUser().subscribe((data: User)=>{
      this.currentUserData=data;

      if(this.currentUserData.coverImage !==null){
        this.coverClientUrl.fileName = this.currentUserData.coverImage.fileName;
        this.coverClientUrl.filePath = this.currentUserData.coverImage.filePath;
      }

      if(this.currentUserData.avatar !==null){
        this.avatarClientUrl.fileName = this.currentUserData.avatar.fileName;
        this.avatarClientUrl.filePath = this.currentUserData.avatar.filePath;
      }
    });
  }

    //add cover img
    onCoverImgChange($event) {
      console.log($event);
    if ($event.target.files && $event.target.files[0]) {
      this.coverClientUrl.fileName = $event.target.files[0].name;
      this.coverClientFile = $event.target.files[0];
      this.userData.uploadUserCoverImage(this.coverClientFile)
      .subscribe((succes:any)=>{
        console.log(succes)
      },
        (error)=> {
          if(error.error.reason === 'fileSizeTooBig'){
              this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
          } else if(error.error.reason === 'wrongExtension'){
              this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
  
          }else{
              this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
          }
  
      }
      )
     

      const reader = new FileReader();
      reader.onload = () => this.coverClientUrl.filePath = reader.result;
      reader.readAsDataURL(this.coverClientFile);
    }
  }

  removeCoverImg() {
    this.coverClientUrl = {
      fileName: undefined,
      filePath: undefined
    };
    this.coverClientFile = undefined;
    console.log("thumbnail removed");
  }

  //change avatar

  onAvatarChange($event) {
    console.log($event);
    if ($event.target.files && $event.target.files[0]) {
    this.avatarClientUrl.fileName = $event.target.files[0].name;
    this.avatarClientFile = $event.target.files[0];

    this.userData.uploadUserAvatar(this.avatarClientFile).subscribe((data:any)=>{
      if (data.success) {
        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.UPLOAD-AVATAR.SUCCESS"), "success");
      } else {
        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.UPLOAD-AVATAR.ERROR"), "error");
      }
    }, error => {
      if(error.error.reason === 'fileSizeTooBig') {
        this.toastService.showToast('Error', 'Fișierul încărcat este prea mare. Trebuie să aibă maxim 2MB.', "error");
      } else if(error.error.reason === 'wrongExtension') {
        this.toastService.showToast('Error', 'Formatul imaginii incarcate, nu este permis.', "error");
      }else {
        this.toastService.showToast('Error', 'Fișierul NU a fost încărcat!', "error");
      }
    });

    const reader = new FileReader();
    reader.onload = () => this.avatarClientUrl.filePath = reader.result;
    reader.readAsDataURL(this.avatarClientFile);
  }
}


}
