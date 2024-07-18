import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedExperience} from "../../shared/_models/shared-experience.model";
import {ResourcesService} from "../../shared/_services/resources.service";
import {Subject, take, takeUntil} from "rxjs";
import {ResourceType} from "../../shared/_models/resource-type.model";
import {User} from "../../shared/_models/user.model";
import {UserDataService} from "../../shared/_services/userData.service";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-shared-experiences-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './shared-experiences-card.component.html',
    styleUrls: ['./shared-experiences-card.component.scss']
})
export class SharedExperiencesCardComponent implements OnInit, OnDestroy {

    @Input() experience: SharedExperience;

    private ngUnsubscribe = new Subject<void>();

    resourceTypeName: string;
    usersJoined = [];

    constructor(private resourceTypeService: ResourcesService,
                private userDataService: UserDataService) {
    }

    ngOnInit() {
        // if (this.experience.resourceType) {
        //     this.getResourceType();
        // }

        console.log(this.experience);

    }

    // getResourceType() {
    //     this.resourceTypeService.getResourceTypeById(this.experience.resourceType)
    //         .pipe(takeUntil(this.ngUnsubscribe))
    //         .subscribe({
    //             next: (resourceType: ResourceType) => {
    //                 this.resourceTypeName = resourceType?.nameEn;
    //             }
    //         })
    // }

    //ARRAY FOR MEMBERS
    // createUsersJoined() {
    //     this.usersJoined = [];
    //     if (this.experience.participants?.length > 0) {
    //         if (this.experience.participants?.length > 3) {
    //             for(let i = 0; i<3; i++ ){
    //                 this.userDataService.getUserById(this.experience.participants[i].userId)
    //                     .pipe(takeUntil(this.ngUnsubscribe))
    //                     .subscribe({
    //                         next: (userData: User) => {
    //                             this.usersJoined.push(userData.avatar.filePath);
    //                         }
    //                     })
    //             }
    //         } else {
    //             for (let participant of this.experience.participants) {
    //                 this.userDataService.getUserById(participant.userId)
    //                     .pipe(takeUntil(this.ngUnsubscribe))
    //                     .subscribe({
    //                         next: (userData: User) => {
    //                             this.usersJoined.push(userData.avatar.filePath);
    //                         }
    //                     })
    //             }
    //         }
    //
    //         console.log('useri', this.usersJoined);
    //     }
    // }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
