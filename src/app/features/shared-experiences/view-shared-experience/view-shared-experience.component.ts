import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, take, takeUntil} from "rxjs";
import {SharedExperiencesService} from "../../../shared/_services/shared-experiences.service";
import {ActivatedRoute} from "@angular/router";
import {SharedExperience} from "../../../shared/_models/shared-experience.model";
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-view-shared-experience',
    templateUrl: './view-shared-experience.component.html',
    styleUrls: ['./view-shared-experience.component.scss']
})
export class ViewSharedExperienceComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();

    currentExperience: SharedExperience;
    availableSpotsLeft: number;
    acceptedParticipants: number;
    isHost : boolean;

    userJoined = false;
    currentUser: User;

    imgPath: string;
    accepted = false;

    constructor(private sharedExperienceService: SharedExperiencesService,
                private route: ActivatedRoute,
                private userDataService: UserDataService,
                private toastService: ToastService,
                private translate: TranslateService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.getSharedExperience();
        // this.calculateAvailableSpots();
        // this.checkIfUserJoined();
    }

    checkIfHost(){
        this.userDataService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({next:(user:User)=>{
                this.currentUser = user;
                if(this.currentExperience?.userId === user.id){
                    this.isHost=true;
                    console.log('e host')
                }else{
                    this.isHost = false;
                    console.log('nu e host')
                    this.checkIfUserJoined(user.id);
                }
                }})
    }


    checkIfUserJoined(currentUserId){
        if(this.currentExperience?.participants?.length > 1){
            const participant = this.currentExperience?.participants.find(partic => partic.userId === currentUserId);
            console.log('lala', participant)
            if(participant){
                this.userJoined = true;
                if(participant.accepted){
                    this.accepted = true;
                }
            }
            // this.currentExperience?.participants.forEach((participant:any)=>{
            //     console.log('currnt', this.currentUser);
            //     if(participant.userId === currentUserId) {
            //         this.userJoined = true;
            //
            //         if(participant.accepted){
            //             this.accepted = true;
            //         }
            //         console.log('e participant');
            //     }else{
            //         this.userJoined = false;
            //     }
            //
            //
            // })
        }

    }


    getSharedExperience() {
        this.route.params.subscribe(params => {
            // console.log(params['slug']);
            if (params['slug'] !== null) {
                this.sharedExperienceService.getSharedExperienceBySlug(params['slug'])
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: (experience: SharedExperience) => {
                            console.log('experienta mea',experience);
                            this.currentExperience = {...experience};
                            this.checkIfHost();
                            this.calculateAvailableSpots();
                        }
                    })
            } else {
                console.log('nu am slug')
            }
        });
    }

    calculateAvailableSpots(){
        this.acceptedParticipants = 0;
        // console.log('salut', this.currentExperience?.participantsLimit);
        if(this.currentExperience?.participantsLimit){
            this.currentExperience.participants.forEach((participant:any)=>{
                if(participant.accepted){
                    this.acceptedParticipants++;
                    // console.log('participant la calcul', this.acceptedParticipants);
                }
            })

            this.availableSpotsLeft = Number(this.currentExperience?.participantsMaxNumber) - this.acceptedParticipants;
            // console.log('locuri libere',this.availableSpotsLeft);
        }
    }

    requestToJoinSharedExp(){
        this.sharedExperienceService.requestToJoinSharedExperience(this.currentExperience.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next:(response: {success: boolean, reason: string})=>{
                    // console.log(response);
                if(response){
                    this.toastService.showToast('Success', 'Cererea ta a fost trimisa!', "success");
                    this.userJoined = true;
                    this.cdr.detectChanges();
                }
                },
            error: (err:any) => {
                console.log(err.error.reason);
                if(err.error.reason === 'alreadyExists'){
                    this.toastService.showToast('Error', 'Se pare ca te-ai alaturat deja experientei!', "error");
                }else{
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error");
                }
                
            }})
    }


    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
