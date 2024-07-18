import {Component, OnInit} from '@angular/core';
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {ItinerariesStore} from "../_services/itineraries.store";
import {Observable} from "rxjs";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";

interface ItinerariesData {
    systemSettings: SystemSetting;
    itineraries: Itinerary[];
}

@Component({
    selector: 'app-recommended-itineraries',
    templateUrl: './recommended-itineraries.component.html',
    styleUrls: ['./recommended-itineraries.component.scss']
})
export class RecommendedItinerariesComponent implements OnInit {

    data$: Observable<ItinerariesData>;

    constructor(private itinerariesStore: ItinerariesStore,
                private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit(): void {
        this.checkForStoreData();
    }

    checkForStoreData() {
        const extraInfo = this.itinerariesStore.getItineraryExtraInfo();

        if (!extraInfo) {
            void this.router.navigate(['../'], {relativeTo: this.route});
        } else {
            this.getItinerariesData();
        }
    }

    getItinerariesData() {
        const systemSettings$ = this.itinerariesStore.getSystemSetting();

        const itineraries$ = this.itinerariesStore.listItineraryFiltered(0, -1, null, null);
        this.data$ = combineLatest([systemSettings$, itineraries$])
            .pipe(
                map(([systemSettings, itineraries]) => {
                    return {
                        systemSettings,
                        itineraries
                    }
                })
            );
    }

    selectItinerary(itinerary: Itinerary) {
        this.itinerariesStore.setItinerary(itinerary);

        void this.router.navigate(['itinerary'], {relativeTo: this.route});
    }
}
