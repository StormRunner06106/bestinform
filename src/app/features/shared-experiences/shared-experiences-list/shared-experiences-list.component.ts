import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedExperiencesService} from "../../../shared/_services/shared-experiences.service";
import {Subject, takeUntil} from "rxjs";
import {SharedExperience} from "../../../shared/_models/shared-experience.model";
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-shared-experiences-list',
    templateUrl: './shared-experiences-list.component.html',
    styleUrls: ['./shared-experiences-list.component.scss']
})
export class SharedExperiencesListComponent implements OnInit, OnDestroy {

    searchFilter: FormControl = new FormControl('');
    private ngUnsubscribe = new Subject<void>();

    // information about filters and pagination
    paginationInfo: any;

    pageNumber: number;
    pageSize: number;
    pageSizeArray = [5, 10, 25, 100];
    sorting = 'startDate';
    dir = 'desc';

    sharedExperiences: Array<SharedExperience>;


    constructor(private sharedExperiencesService: SharedExperiencesService
    ) {}

    ngOnInit() {
        this.pageNumber = 1;
        this.pageSize = 5;

        this.getSharedExperiences();
    }

    getSharedExperiences() {
        this.sharedExperiences = [];
        const filters = {
            name: this.searchFilter.value !== '' ? this.searchFilter.value : null
        };
        this.sharedExperiencesService.listSharedExperiencesFiltered(this.pageNumber -1, this.pageSize, this.sorting, this.dir, filters)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next:(sharedExperiences:any)=>{
                    console.log('shared', sharedExperiences.content);
                    this.sharedExperiences = sharedExperiences.content;
                    this.paginationInfo = sharedExperiences;
                }})
    }

    pageChanged(event){
        console.log('schimb pagina');
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.sharedExperiences = [];



        this.sharedExperiencesService.listSharedExperiencesFiltered(this.pageNumber -1, this.pageSize, this.sorting, this.dir, {})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next:(sharedExperiences:any)=>{
                    // console.log('shared', sharedExperiences.content);
                    this.sharedExperiences = sharedExperiences.content;
                    this.paginationInfo = sharedExperiences;
                }})
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
