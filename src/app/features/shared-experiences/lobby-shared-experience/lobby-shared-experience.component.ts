import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {SharedExperience} from "../../../shared/_models/shared-experience.model";
import {SharedExperiencesService} from "../../../shared/_services/shared-experiences.service";
import {ActivatedRoute} from "@angular/router";
import {UserDataService} from "../../../shared/_services/userData.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../../../shared/_models/user.model";

@Component({
  selector: 'app-lobby-shared-experience',
  templateUrl: './lobby-shared-experience.component.html',
  styleUrls: ['./lobby-shared-experience.component.scss']
})
export class LobbySharedExperienceComponent implements OnInit, OnDestroy{
  private ngUnsubscribe = new Subject<void>();

  currentExperience: SharedExperience;
  availableSpotsLeft: number;
  acceptedParticipants: number;
  isHost = false;
  currentUserId: string;

  arrayPending: any;
  arrayParticipants: any;

  imgPath: string;

  constructor(private sharedExperienceService: SharedExperiencesService,
              private route: ActivatedRoute,
              private userDataService: UserDataService,
              private toastService: ToastService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.getSharedExperience();
    this.checkIfHost();

  }

  checkIfHost(){
    this.userDataService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(user:User)=>{
          this.currentUserId = user.id;
            if(this.currentExperience.userId === user.id){
              this.isHost=true;
            }
          }})
  }

  makeParticipantsArrays(){
    this.arrayParticipants = [];
    this.arrayPending = [];
    if(this.currentExperience?.participants.length > 0){
      this.currentExperience?.participants.forEach((participant:any)=>{
        console.log(participant);
        if(participant.accepted && participant.type !== 'owner' ){
            this.arrayParticipants.push(participant);
          }else if(!participant.accepted && participant.type === 'request' ){
            this.arrayPending.push(participant);
          }
      })
    }

  }

  getSharedExperience() {
    this.route.params.subscribe(params => {
      console.log(params['slug']);
      if (params['slug'] !== null) {
        this.sharedExperienceService.getSharedExperienceBySlug(params['slug'])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (experience: SharedExperience) => {
                console.log('experienta mea',experience);
                this.currentExperience = {...experience};
                this.makeParticipantsArrays();
                console.log('experienta curenta',this.currentExperience);
              }
            })
      } else {
        console.log('nu am slug')
      }
    });
  }



  // requestToJoinSharedExp(){
  //   this.sharedExperienceService.requestToJoinSharedExperience(this.currentExperience.id)
  //       .pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe({
  //         next:(response: {success: boolean, reason: string})=>{
  //           if(response){
  //             this.toastService.showToast('Success', 'Cererea ta a fost trimisa!', "success")
  //           }
  //         },
  //         error: () => {
  //           this.toastService.showToast(
  //               this.translate.instant("TOAST.ERROR"),
  //               this.translate.instant("TOAST.SERVER-ERROR"),
  //               "error");
  //         }})
  // }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
