import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {JobsStore} from "../_services/jobs.store";
import {Observable} from "rxjs";
import {ResourceType} from "../../../shared/_models/resource-type.model";

@Component({
    selector: 'app-job-offers',
    templateUrl: './job-offers.component.html',
    styleUrls: ['./job-offers.component.scss'],
    providers: [JobsStore]
})
export class JobOffersComponent implements OnInit {
    @ViewChild('jobsList') jobsListRef: ElementRef;

    myJobOffers: boolean;
    resourceType$: Observable<ResourceType>;

    constructor(private jobsStore: JobsStore) {
    }

    ngOnInit(): void {
        this.resourceType$ = this.jobsStore.resourceTypeObs$;
        this.myJobOffers = this.jobsStore.getMyJobOffersState();
    }

    scrollResourcesListIntoView() {
        this.jobsListRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    }

}
