import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {JobsStore} from "../_services/jobs.store";
import {JobService} from "../_services/job.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {firstValueFrom} from "rxjs";

@Component({
    selector: 'app-candidates-list',
    templateUrl: './candidates-list.component.html',
    styleUrls: ['./candidates-list.component.scss'],
    providers: [JobsStore]
})
export class CandidatesListComponent implements OnInit {

    @ViewChild('jobsList') jobsListRef: ElementRef;

    candidatesListSettings: any;
    candidatesList: [];

    // pagination
    pageNr = 0;
    pageSize = 10;
    sortByProperty = 'name';
    sortDirection = 'asc';
    totalElements;
    @ViewChild('candidatesPaginator') candidatesPaginator: MatPaginator;

    constructor(private settingsService: SystemSettingsService,
                private jobService: JobService) {
    }

    ngOnInit() {
        this.getSettings();
        this.getCandidatesList();
    }

    getCandidatesList() {
        const filters = {
            // isPublic: true
        }
        this.jobService.getListCvFilteredpage(this.pageNr, this.pageSize, this.sortByProperty, this.sortDirection, filters).subscribe({
            next: (list: any) => {
                this.candidatesList = list.content;
                this.totalElements = list.totalElements;
                console.log(this.candidatesList);
            }
        })
    }

    onPaginationChange(event: PageEvent) {
        if (event.pageSize !== this.pageSize) {
            this.pageSize = event.pageSize;
            this.candidatesPaginator.firstPage();
        }
        this.pageNr = event.pageIndex;
        this.getCandidatesList();
    }


    getSettings() {
        this.settingsService.getSystemSetting().subscribe({
            next: (settings: SystemSetting) => {
                console.log(settings);
                this.candidatesListSettings = settings.jobOptions.candidates;
            }
        })
    }

    scrollResourcesListIntoView() {
        this.jobsListRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
}
