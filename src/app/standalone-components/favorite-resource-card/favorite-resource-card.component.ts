import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Resource} from "../../shared/_models/resource.model";
import {ResourcesService} from "../../shared/_services/resources.service";
import {Subject, takeUntil} from "rxjs";
import {ResourceType} from "../../shared/_models/resource-type.model";

@Component({
    selector: 'app-favorite-resource-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './favorite-resource-card.component.html',
    styleUrls: ['./favorite-resource-card.component.scss']
})
export class FavoriteResourceCardComponent implements OnInit, OnDestroy{

    @Input() resource: Resource;
    @Input() favorite: boolean;

    resourceTypeName: string;

    private ngUnsubscribe = new Subject<void>();

    notFoundImg = "https://theperfectevent.com/wp-content/uploads/2020/01/Main-Scroll-2.jpg";

    constructor(private resourceService: ResourcesService) {
    }

    ngOnInit() {
        this.getResourceTypeName();
    }

    getResourceTypeName(){
        if(this.resource.resourceTypeId !== null && this.resource.resourceTypeId !== 'string'){
            this.resourceService.getResourceTypeById(this.resource.resourceTypeId)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next:(res:ResourceType) => {
                        this.resourceTypeName = res.nameRo;
                    }
                })
        }
    }

    addResourceToFavorite() {
        console.log('ADD');
        this.favorite = !this.favorite;
        this.resourceService.addResourceToFavorite(this.resource.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res:{ success: boolean, reason: string }) => {
                    console.log('l-am scos de la fav?', res);
                }
            })
    }

    deleteResourceFromFavorite() {
        console.log('DEL');
        this.favorite = !this.favorite;
        this.resourceService.deleteResourceFromFavorite(this.resource.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: { success: boolean, reason: string }) => {
                    console.log('l-am scos de la fav?', res);
                }
            })
    }

    ngOnDestroy(){
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
