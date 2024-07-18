import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserLocationService} from "../../../../../shared/_services/user-location.service";

@Component({
    selector: 'app-trial-active',
    templateUrl: './trial-active.component.html',
    styleUrls: ['./trial-active.component.scss']
})
export class TrialActiveComponent implements OnInit {

    constructor( private router: Router,
                 private userLocationService: UserLocationService) {
    }

    ngOnInit() {
    }

    goToHp(){
        this.router.navigate(['/client']).then(() => {
            console.log('after login promise');
            this.userLocationService.checkUserCoordinates();
        });
    }

}
