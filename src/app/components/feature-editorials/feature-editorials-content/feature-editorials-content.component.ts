import {Component, OnInit} from '@angular/core';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { EditorialsService } from 'src/app/shared/_services/editorials.service';
import {FeatureEditorialsContentService} from "./shared/serviceas/feature-editorials-content.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Observable, switchMap, tap} from "rxjs";
import {AsyncPipe, JsonPipe, NgForOf, NgStyle} from "@angular/common";
import {CarouselModule} from "primeng/carousel";
import {ButtonModule} from "primeng/button";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {GalleriaModule} from "primeng/galleria";
import {FeatureEditorialsService} from "../shared/feature-editorials.service";
import {map} from "rxjs/operators";
import {YoutubeEmbedPipe} from "./shared/safe-url.pipe";

@Component({
    selector: 'app-feature-editorials-content',
    templateUrl: './feature-editorials-content.component.html',
    styleUrls: ['./feature-editorials-content.component.scss'],
    standalone: true,
    imports: [
        AsyncPipe,
        JsonPipe,
        NgStyle,
        NgForOf,
        CarouselModule,
        ButtonModule,
        MatButtonModule,
        MatIconModule,
        GalleriaModule,
        YoutubeEmbedPipe,
        ShareButtonsModule,
        ShareIconsModule
    ],
    providers: [FeatureEditorialsContentService, FeatureEditorialsService]
})
export class FeatureEditorialsContentComponent implements OnInit {
    private editorialsContentSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    public editorialsContent$: Observable<any> = this.editorialsContentSubject.asObservable();

    private editorialsAllSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    public editorialsAll$: Observable<any[]> = this.editorialsAllSubject.asObservable();

    display: boolean = false;

    currentRoute: string;

    public images: any[] = [
        {
            src: 'https://dev.bestinform.eu/bestinform/files/editorials/64199e3ed4bcff67ed2a2fc9/DJI_0038.jpg',
            alt: 'Image 1'
        },
        {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbjWLbw0xDnseAe0RSVM04hi5o8WKTM4xYUhRmwp32Jw&s',
            alt: 'Image 3'
        },
        {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGibaggkS0JqYFpMp1M2Z-sqMznir-nylIoaxQ_ghWYw&s',
            alt: 'Image 4'
        },
        {
            src: 'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630',
            alt: 'Image 2'
        },
        {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGibaggkS0JqYFpMp1M2Z-sqMznir-nylIoaxQ_ghWYw&s',
            alt: 'Image 4'
        },
        {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGibaggkS0JqYFpMp1M2Z-sqMznir-nylIoaxQ_ghWYw&s',
            alt: 'Image 4'
        },
        {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGibaggkS0JqYFpMp1M2Z-sqMznir-nylIoaxQ_ghWYw&s',
            alt: 'Image 4'
        },
        {
            src: 'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630',
            alt: 'Image 2'
        },
    ];


    // Have no idea if this one should come from the API
    public socialMediaLinks: any[] = [
        {iconLink: '../../../../assets/images/others/copy-icon.svg'},
        {iconLink: '../../../../assets/images/others/linked.svg'},
        {iconLink: '../../../../assets/images/others/facebook.svg'},
    ];

    imgContainer: any[] = [];

    constructor(
        private featureEditorialsContentSrvc: FeatureEditorialsContentService,
        private route: ActivatedRoute,
        private editorialSrvc: FeatureEditorialsService,
        private router: Router,
        private editorialsService: EditorialsService
    ) {
    }

    ngOnInit() {
        this.currentRoute = this.router.url;
        // this.getEditorialsContent();
        this.getEditorialsSuggestions();
        this.formatImages();
        this.editorialsService.getEditorialCategories();
        this.route.params.subscribe(params => {
            console.log('params', params);
            this.editorialsService.getEditorialBySlug(params.id);
            this.editorialsService.selectedEditorial.subscribe(data => {
                this.editorialsContentSubject.next(data);
                console.log('received data for editorial', data);
            });
            // this.editorialsService.getEditorialBySlug(params.id).subscribe(editorial => {
            //     console.log('this.editorial', editorial);
            // });
        });
    }

    isMobile(): boolean {
        return window.innerWidth < 980;
    }

    private getEditorialsSuggestions(): void {
        this.editorialSrvc.listEditorialFiltered(0, 9, 'date', 'desc',  {})
            .pipe(
                map((items: any) => {
                    items.content = items.content.filter(value => {
                        return value.id !== this.editorialsContentSubject.getValue().id
                    })
                    return items;
                }),
                tap(values => {
                    this.editorialsAllSubject.next(values.content);
                })
            )
            .subscribe()
    }

    formatImages() {
        console.log(this.images)
        let remainingImages = this.images.slice();
        let row: any[] = [];

        // @TODO Replace while loop with for of or whatever
        // A little bit strange solution, but it works
        while (remainingImages.length > 0) {
            if (remainingImages.length === 1) {
                row.push({src: remainingImages.shift(), flex: '1 100%'});
            } else if (remainingImages.length === 2) {
                row.push({src: remainingImages.shift(), flex: '1 50%'});
                row.push({src: remainingImages.shift(), flex: '1 50%'});
            } else {
                row.push({src: remainingImages.shift(), flex: '1 100%'});
                row.push({src: remainingImages.shift(), flex: '1 50%'});
                row.push({src: remainingImages.shift(), flex: '1 50%'});
            }
            this.imgContainer.push(row);
            row = [];
        }
    }

    public galleriaClass(): string {
        return `custom-galleria ${this.display ? "fullscreen" : ""}`;
    }

    private getEditorialsContent(): void {
        this.route.paramMap
            .pipe(
                switchMap(item => {
                    return this.featureEditorialsContentSrvc.getEditorialsBySlug(item['params'].id)
                }),
                tap(data => {
                    this.editorialsContentSubject.next(data);
                })
            ).subscribe()
    }

    public seeAllEditorials(): void {
        this.router.navigate([`/client/dashboard/editorials`]);
    }

    public redirectBySlug(slug: string): void {
        this.router.navigate([`/client/dashboard/editorials/${slug}`]);

        // TODO move logic with redirection into parent component
        // Strange approach, need to find better way and need to make this component "dummy"
        setTimeout(() => {
            window.location.reload();
        }, 600)
    }

    getFormattedDate(): string {
        const editorial = this.editorialsContentSubject.value;
        if (!editorial?.date) return;
        const date = new Date(editorial?.date[0], editorial?.date[1] - 1, editorial?.date[2]);
        return date.toLocaleDateString("en-GB", { // you can use undefined as first argument
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }
}
