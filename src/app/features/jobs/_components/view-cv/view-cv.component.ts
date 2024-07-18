import {Component, OnInit} from '@angular/core';
import {SystemSetting} from "../../../../shared/_models/system-setting.model";
import {SystemSettingsService} from "../../../../shared/_services/system-settings.service";
import {CVService} from "../../_services/cv.service";
import {of, switchMap} from "rxjs";
import {Resource} from "../../../../shared/_models/resource.model";
import {ActivatedRoute} from "@angular/router";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {User} from "../../../../shared/_models/user.model";

@Component({
    selector: 'app-view-cv',
    templateUrl: './view-cv.component.html',
    styleUrls: ['./view-cv.component.scss']
})
export class ViewCvComponent implements OnInit {

    cvSettings: any;
    currentCv: any;
    readMore = true;

    currentUserId: string;
    myCv = false;

    constructor(private settingsService: SystemSettingsService,
                private cvService: CVService,
                private route: ActivatedRoute,
                private userData: UserDataService) {
    }

    ngOnInit() {
        this.getSettings();
        this.getCvData();
    }

    getSettings() {
        this.settingsService.getSystemSetting().subscribe({
            next: (settings: SystemSetting) => {
                console.log(settings);
                this.cvSettings = settings.jobOptions.myCv;
            }
        })
    }

    getCurrentUser(){
        this.userData.getCurrentUser().subscribe({
            next:(currentUser:User)=>{
                this.currentUserId = currentUser.id;
                console.log('current user id', this.currentUserId);
            }
        })
    }

    getCvData() {
        this.getCurrentUser();
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                if (params.get('userId')) {
                    if (params.get('userId') === this.currentUserId ) {
                        this.myCv = true;
                    }
                    return this.cvService.getCvByUserId(params.get('userId'));
                } else {
                    return of('');
                }
            })
        ).subscribe((cv: any) => {
            console.log('GET CV', cv);
            this.currentCv = cv;
        })
    }

    changeReadMore() {
        this.readMore = !this.readMore;
    }

    downloadCv(){
        const link = document.createElement('a');
        const cv = this.currentCv.pdfCv;
        link.href = cv?.filePath;
        link.download = cv?.fileName;
        link.target = '_blank';
        link.click();
    }

}
