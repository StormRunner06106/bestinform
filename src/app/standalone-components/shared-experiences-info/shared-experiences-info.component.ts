import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Resource} from "../../shared/_models/resource.model";
import {SharedExperience} from "../../shared/_models/shared-experience.model";
import {Subject, takeUntil} from "rxjs";
import {ResourcesService} from "../../shared/_services/resources.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ResourceType} from "../../shared/_models/resource-type.model";
import {MatMenuModule} from "@angular/material/menu";
import {User} from "../../shared/_models/user.model";
import {UserDataService} from "../../shared/_services/userData.service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SharedExperiencesService} from "../../shared/_services/shared-experiences.service";
import {ToastService} from "../../shared/_services/toast.service";
import {RouterLink} from "@angular/router";
import {SharedExperiencesModule} from "../../features/shared-experiences/shared-experiences.module";
import {
    AfterCreateDeleteComponent
} from "../../features/shared-experiences/_components/after-create-delete/after-create-delete.component";
import {MatDividerModule} from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { SharedExpMapComponent } from 'src/app/features/domain-listing/_components/shared-exp-map/shared-exp-map.component';

@Component({
  selector: 'app-shared-experiences-info',
  standalone: true,
    imports: [CommonModule, MatMenuModule, TranslateModule, RouterLink, AfterCreateDeleteComponent, MatDividerModule],
  templateUrl: './shared-experiences-info.component.html',
  styleUrls: ['./shared-experiences-info.component.scss'],
    providers: [NgbModal, NgbActiveModal]
})
export class SharedExperiencesInfoComponent implements OnInit, OnDestroy{

  @Input() experience: SharedExperience;
  @Input() showMenu: boolean;

    @ViewChild('after') after: any;

  private ngUnsubscribe = new Subject<void>();

  resource: Resource;
  currentLanguage: string;
  resType: ResourceType;
  readMore= true;
  isHost = false;
  isProvider = false;

  constructor(private resourceService: ResourcesService,
              private translate: TranslateService,
              private userDataService: UserDataService,
              private modalService: NgbModal,
              private activeModalService: NgbActiveModal,
              private sharedExperienceService: SharedExperiencesService,
              private toastService: ToastService,
              private matDialog: MatDialog,
              ) {
  }

  ngOnInit() {
    this.getResource();
    this.checkLanguage();
    this.getResTypeName();
    console.log('EXPERIENTA DIN INPUT', this.experience);
  }

    openModal(content){
        this.modalService.open(content, {centered: true, size: "sm"});
        console.log('da');
    }

    openModalRef(content){
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    openMap(){
      this.matDialog.open(SharedExpMapComponent,
        {width: "100%", 
        height: "90%", 
        data: {
          experienceData: this.experience,
        // coordinate: this.experience.geographicalCoordinates
        // resourceCoordinatesData:this.coordinatesData,
        // filterData: this.selectedCity
    } })
    }

    checkIfHost(){
        this.userDataService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({next:(user:User)=>{
                    if(this.experience.userId === user.id){
                        this.isHost=true;
                    }
                    if(user.roles.includes('ROLE_PROVIDER')){
                        this.isProvider = true;
                    }
                }})
    }

    cancelExperience(){
      this.sharedExperienceService.deleteSharedExperience(this.experience.id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
              next:(response:{success: boolean, reason: string})=>{
                  if(response.success){
                    this.openModalRef(this.after);
                  }
              }
          })

        this.openModalRef(this.after);
    }

  checkLanguage() {
    this.currentLanguage = this.translate.currentLang;
    this.translate.onLangChange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: res => {
            this.currentLanguage = res.lang;
          }
        });
  }


  getResource(){
    this.resourceService.getResourceById(this.experience.resourceId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(resource: Resource)=>{
          console.log('resursa',resource);
          this.resource = resource;
          this.checkIfHost();
          }})
  }

  getResTypeName(){
    this.resourceService.getResourceTypeById(this.resource?.resourceTypeId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next:(resType: ResourceType)=>{
            this.resType = resType;
          }
        })
  }

  changeReadMore(){
      this.readMore = !this.readMore;
  }

  leaveExperience(){
    this.sharedExperienceService.leaveSharedExperience(this.experience.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(resp:{success: boolean, reason: string})=>{
            if(resp.success){
                this.toastService.showToast('Success', 'Ai parasit aceasta experienta!', "success");
                this.modalService.dismissAll();
            }
            }})
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
