import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserDataService} from "../../shared/_services/userData.service";
import {Subject, takeUntil} from "rxjs";
import {User} from "../../shared/_models/user.model";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {SharedExperiencesService} from "../../shared/_services/shared-experiences.service";
import {Resource} from "../../shared/_models/resource.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-display-user',
  standalone: true,
    imports: [CommonModule, MatIconModule, MatMenuModule, TranslateModule],
  templateUrl: './display-user.component.html',
  styleUrls: ['./display-user.component.scss']
})
export class DisplayUserComponent implements OnInit, OnDestroy{

  @Input() userId: string;
  @Input() isAdmin: boolean;
  @Input() showMenu: boolean;
  @Input() menuType: string;
  @Input() experienceId: string;
  @Input() candidate: any;
  @Output() refreshPage = new EventEmitter<boolean>();

  user: User;

  private ngUnsubscribe = new Subject<void>();

  constructor(private userDataService: UserDataService,
              private sharedExperienceService: SharedExperiencesService,
              private modalService: NgbModal,
              private translate: TranslateService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.getUserData();
  }

  getUserData(){
    this.userDataService.getUserById(this.userId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(user: User)=>{
          this.user = user;
          console.log(user);
          }})
  }

  openModal(content){
      this.modalService.open(content, {centered: true, size: "sm"});
  }

  respondToRequest(accepted: boolean){
    console.log(this.experienceId);
    this.sharedExperienceService.respondToRequest(this.experienceId, this.userId, accepted)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(resp:{success: boolean, reason: string})=>{
          console.log('dupa accept/reject', resp);
          if(resp.success){
            this.refreshPage.emit(true);
          }
          }})
  }

  kickParticipant(){
    this.sharedExperienceService.deleteParticipantFromExperience(this.experienceId, this.userId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(response:{success: boolean, reason: string})=>{
          if(response.success){
            this.refreshPage.emit(true);
            this.modalService.dismissAll();
          }
          }})
  }

  downloadCv(){
      const link = document.createElement('a');
      const cv = this.menuType === 'candidate' ? this.candidate.pdfCv : this.user.cv;
      link.href = cv.filePath;
      link.download = cv.fileName;
      link.target = '_blank';
      link.click();
  }

  navigateToCv(){
      const userId = this.menuType === 'candidate' ? this.candidate.userId : this.user.id;
      this.router.navigate([this.menuType === 'candidate' ? '../cv' : '../../cv', userId], {relativeTo: this.route});
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
