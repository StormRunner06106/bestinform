import {Component, OnInit} from '@angular/core';
import {ResourcesService} from "../../../shared/_services/resources.service";
import {Domain} from "../../../shared/_models/domain.model";
import {DomainsService} from "../../../shared/_services/domains.service";

@Component({
    selector: 'app-domains-list',
    templateUrl: './domains-list.component.html',
    styleUrls: ['./domains-list.component.scss']
})
export class DomainsListComponent implements OnInit {
    //Travel data
    travelCategories = 0;
    travelResTypes = 0;
    travelId = '63bfcca765dc3f3863af755c';
    travelImgPath : string;

    //Health data
    healthCategories = 0;
    healthResTypes = 0;
    healthId = '63bfda2765dc3f3863af755f';
    healthImgPath : string;

        //Culture data
        cultureCategories = 0;
    cultureResTypes = 0;
    cultureId = '63bfda7e65dc3f3863af7560';
    cultureImgPath : string;


    //Education data
    educationCategories = 0;
    educationResTypes = 0;
    educationId = '63bfda9365dc3f3863af7561';
    educationImgPath : string;


    //Jobs data
    jobsCategories = 0;
    jobsResTypes = 0;
    jobsId = '63bfdaaa65dc3f3863af7562';
    jobsImgPath : string;



    constructor(private resourceService: ResourcesService,
                private domainService: DomainsService) {
    }

    ngOnInit(): void {
        this.getCategoriesDataTravel();
        this.getCategoriesDataHealth();
        this.getCategoriesDataCulture();
        this.getCategoriesDataEducation();
        this.getCategoriesDataJobs();
    }

    getCategoriesDataTravel() {
        this.domainService.getDomainById(this.travelId).subscribe((domain:Domain)=>{
            this.travelImgPath = domain.image.filePath;
        });
        this.resourceService.getResourceByDomain(this.travelId).subscribe((res: Array<object>) => {
            // console.log('TRAVEL', res);
            this.travelCategories = res.length;
            res.forEach(categ => {
                // console.log('categ', categ["resourceTypes"].length);
                this.travelResTypes += categ["resourceTypes"].length;
                // console.log(this.travelResTypes);
            })
        });


    }

    getCategoriesDataHealth() {
        this.domainService.getDomainById(this.healthId).subscribe((domain:Domain)=>{
            this.healthImgPath = domain.image.filePath;
        })
        this.resourceService.getResourceByDomain(this.healthId).subscribe((res: Array<object>) => {
            // console.log('HEALTH', res);
            this.healthCategories = res.length;
            res.forEach(categ => {
                this.healthResTypes += categ["resourceTypes"].length;
                // console.log(this.healthResTypes);
            })
        });
    }

    getCategoriesDataCulture() {
        this.domainService.getDomainById(this.cultureId).subscribe((domain:Domain)=>{
            this.cultureImgPath = domain.image.filePath;
        });
        this.resourceService.getResourceByDomain(this.cultureId).subscribe((res: Array<object>) => {
            // console.log('CULTURE', res);
            this.cultureCategories = res.length;
            res.forEach(categ => {
                this.cultureResTypes += categ["resourceTypes"].length;
                // console.log(this.cultureResTypes);
            })
        });
    }

    getCategoriesDataEducation() {
        this.domainService.getDomainById(this.educationId).subscribe((domain:Domain)=>{
            this.educationImgPath = domain.image.filePath;
        });
        this.resourceService.getResourceByDomain(this.educationId).subscribe((res: Array<object>) => {
            // console.log('EDUCATION', res);
            this.educationCategories = res.length;
            res.forEach(categ => {
                this.educationResTypes += categ["resourceTypes"].length;
                // console.log(this.educationResTypes);
            })
        });
    }

    getCategoriesDataJobs() {
        this.domainService.getDomainById(this.jobsId).subscribe((domain:Domain)=>{
        this.jobsImgPath = domain.image.filePath;
    });
        this.resourceService.getResourceByDomain(this.jobsId).subscribe((res: Array<object>) => {
            console.log('JOBS', res);
            this.jobsCategories = res.length;
            res.forEach(categ => {
                console.log(categ)
                this.jobsResTypes += categ["resourceTypes"].length;
                console.log(this.jobsResTypes);
            })
        });
    }

}
