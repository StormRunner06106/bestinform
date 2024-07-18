import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SharedExperiencesService} from "../../../../shared/_services/shared-experiences.service";
import {Subject, takeUntil} from "rxjs";
import {ResourcesService} from "../../_services/resources.service";
import {Resource} from "../../../../shared/_models/resource.model";
import {MatSort} from "@angular/material/sort";
import {ProviderLobbyComponent} from "../provider-lobby/provider-lobby.component";
import {
    LobbySharedExperienceComponent
} from "../../../shared-experiences/lobby-shared-experience/lobby-shared-experience.component";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {User} from "../../../../shared/_models/user.model";

@Component({
    selector: 'app-shared-experiences-list',
    templateUrl: './shared-experiences-list.component.html',
    styleUrls: ['./shared-experiences-list.component.scss']
})
export class SharedExperiencesListComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject<void>();
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    pageNumber = 0;
    pageSize = 10;
    pageSizeArray = [10, 25, 50, 100];
    sorting = 'date';
    dir = 'desc';
    totalElements: number;
    dataSource = [];

    displayedColumns = ['id', 'name', 'date', 'time', 'participants', 'actions'];

    currentResource: Resource;
    userId: string;


    constructor(public dialogRef: MatDialogRef<SharedExperiencesListComponent>,
                @Inject(MAT_DIALOG_DATA) public resourceId,
                private sharedExperienceService: SharedExperiencesService,
                private resourceService: ResourcesService,
                public dialog: MatDialog,
                private userService: UserDataService) {
    }

    ngOnInit() {
        this.getCurrentUser();
        console.log('list res id', this.resourceId);
        // this.getSharedExperiencesList();
        this.getCurrentResource();
    }

    pageChanged(event: any) {
        console.log('page changed');
    }

    getCurrentUser(){
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (user: User) => {
                    this.userId = user.id;
                    this.getSharedExperiencesList();
                }
            })
    }

    getSharedExperiencesList() {
        const filters = {
            resourceId: this.resourceId,
            userId: this.userId
        }
        this.sharedExperienceService.listSharedExperiencesFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filters)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (expList: any) => {
                    console.log('EXP LIST', expList)
                    this.dataSource = expList?.content;
                    this.totalElements = expList?.totalElements;
                }
            })
    }

    getCurrentResource(){
        this.resourceService.getResourceById(this.resourceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (resource: Resource) => {
                    this.currentResource = resource;
                }

            })
    }

    openSharedExperienceLobbyModal(resourceId) {
        this.dialog.open(ProviderLobbyComponent, {
            width: '1000px',
            height: '750px',
            data: resourceId
        });
    }
    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
