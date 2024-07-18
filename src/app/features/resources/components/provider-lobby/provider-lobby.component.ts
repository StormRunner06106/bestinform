import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SharedExperiencesService} from "../../../../shared/_services/shared-experiences.service";
import {Subject, takeUntil} from "rxjs";
import {SharedExperience} from "../../../../shared/_models/shared-experience.model";
import {User} from "../../../../shared/_models/user.model";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {ToastService} from "../../../../shared/_services/toast.service";

@Component({
    selector: 'app-provider-lobby',
    templateUrl: './provider-lobby.component.html',
    styleUrls: ['./provider-lobby.component.scss']
})
export class ProviderLobbyComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject<void>();

    currentExperience: SharedExperience;
    availableSpotsLeft: number;
    acceptedParticipants: number;
    isHost = false;
    currentUserId: string;

    arrayPending: any;
    arrayParticipants: any;

    constructor(public dialogRef: MatDialogRef<ProviderLobbyComponent>,
                @Inject(MAT_DIALOG_DATA) public resourceId,
                private sharedExperienceService: SharedExperiencesService,
                private userDataService: UserDataService) {
    }

    ngOnInit() {
        this.getSharedExperience();

    }

    getSharedExperience() {
        this.sharedExperienceService.getSharedExperienceById(this.resourceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (experience: SharedExperience) => {
                    console.log('experienta mea', experience);
                    this.currentExperience = {...experience};
                    this.makeParticipantsArrays();
                    console.log('experienta curenta', this.currentExperience);
                }
            })

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
                    console.log(this.arrayPending)
                }
            })
        }

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

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
