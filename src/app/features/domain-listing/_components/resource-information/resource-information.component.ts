import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {Resource, ResourceAttribute, TabAttribute} from "../../../../shared/_models/resource.model";
import {takeUntil} from "rxjs/operators";
import Map from "ol/Map";
import View from "ol/View";
import {fromLonLat} from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Feature} from "ol";
import {Point} from "ol/geom";
import {Fill, Icon, Style, Text} from "ol/style";
import {FullScreen} from "ol/control";

@Component({
    selector: 'app-resource-information',
    templateUrl: './resource-information.component.html',
    styleUrls: ['./resource-information.component.scss']
})
export class ResourceInformationComponent implements OnInit, OnDestroy, AfterViewInit {

    resourceData: Resource = null;
    resourceContact: ResourceAttribute = null;

    tabAttributesListByCategory: Array<TabAttribute[]> = [];

    map: Map;
    isValidCoords = false;

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourceFilterService: ResourceFilterService) {
    }

    ngOnInit(): void {
        this.listenForResource();
    }

    listenForResource() {
        this.resourceFilterService.resourceObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceData = {...res};
                    console.log(this.resourceData);
                    // vedem daca exista tabul de contact
                    if (this.resourceData?.attributes) {
                        this.resourceData.attributes.forEach( attribute => {
                            if (attribute.tabName === 'contact') {
                                this.resourceContact = attribute;
                                return;
                            }
                        });
                    }

                    // daca avem tabul de contact, il separam in functie de attributeCategory
                    if (this.resourceContact) {
                        this.resourceContact.tabAttributes.forEach( tabAttribute => {
                            this.pushToCategory(tabAttribute);
                        });
                    }

                    const lat = this.resourceData?.geographicalCoordinates?.latitude;
                    const long = this.resourceData?.geographicalCoordinates?.longitude;
                    if (lat && long && lat >= -90 && lat <= 90 && long >= -180 && long <= 180) {
                        this.isValidCoords = true;
                        this.initMap();
                    }
                }
            });
    }

    pushToCategory(tabAttribute: TabAttribute): void {
        if (this.tabAttributesListByCategory.length > 0) {
            for (let index = 0; index < this.tabAttributesListByCategory.length; index++) {
                if (this.tabAttributesListByCategory[index][0].attributeCategory === tabAttribute.attributeCategory) {
                    this.tabAttributesListByCategory[index].push(tabAttribute);
                    return;
                }
            }
            this.tabAttributesListByCategory[this.tabAttributesListByCategory.length - 1].push(tabAttribute);
            console.log('tab attr', this.tabAttributesListByCategory);

            return;
        } else {
            this.tabAttributesListByCategory.push([tabAttribute]);
            console.log('tab attr', this.tabAttributesListByCategory);
            return;
        }

    }

    initMap() {
        const resourceFeature = new Feature({
            geometry: new Point(fromLonLat([
                +this.resourceData.geographicalCoordinates.longitude,
                +this.resourceData.geographicalCoordinates.latitude
            ]))
        });

        resourceFeature.setStyle(new Style({
            text: new Text({
                text: '\uf3c5',
                font: '900 35px "Font Awesome 5 Free"',
                textBaseline: 'bottom',
                fill: new Fill({
                    color: 'red'
                })
            })
        }));
        // open layers map init
        this.map = new Map({
            view: new View({
                center: fromLonLat([
                    +this.resourceData.geographicalCoordinates.longitude,
                    +this.resourceData.geographicalCoordinates.latitude]),
                zoom: 15,
            }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: new VectorSource({
                        features: [resourceFeature]
                    })
                })
            ],
            controls: [new FullScreen()]
        });
    }

    ngAfterViewInit(): void {
        if (this.map && this.isValidCoords) {
            this.map.setTarget('ol-map');
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
