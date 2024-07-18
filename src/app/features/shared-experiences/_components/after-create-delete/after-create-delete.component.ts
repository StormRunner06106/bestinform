import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {SharedExperiencesService} from "../../../../shared/_services/shared-experiences.service";
import {SharedExperience} from "../../../../shared/_models/shared-experience.model";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-after-create-delete',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink],
    templateUrl: './after-create-delete.component.html',
    styleUrls: ['./after-create-delete.component.scss'],
    providers: [NgbActiveModal, NgbModal]
})
export class AfterCreateDeleteComponent implements OnInit, OnDestroy {

    @Input() create: boolean;
    @Input() sharedExperienceId: string;

    private ngUnsubscribe = new Subject<void>();
    sharedExperienceSlug: string;

    constructor(private sharedExperienceService: SharedExperiencesService,
    private activeModalService: NgbActiveModal,
                private modalService: NgbModal) {
    }

    ngOnInit() {
        this.getSharedExperience();
    }

    getSharedExperience() {
        this.sharedExperienceService.getSharedExperienceById(this.sharedExperienceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (experience: SharedExperience) => {
                this.sharedExperienceSlug= experience?.slug;
                }
            })
    }

    closeModal(){
        // this.modalService.close()
        // this.modalService.dismiss();
        this.modalService.dismissAll();
    }


    ngOnDestroy() {
        this.ngUnsubscribe.next();
        // this.ngUnsubscribe.complete();
    }

}
