import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subject} from "rxjs";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {Resource, ResourceAttribute, TabAttribute} from "../../../../shared/_models/resource.model";
import Map from "ol/Map";
import View from "ol/View";
import {fromLonLat, toLonLat} from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Feature, Overlay} from "ol";
import { Circle, Point} from "ol/geom";
import {Fill, Style, Text} from "ol/style";
import {FullScreen} from "ol/control";
import { ResourceType } from 'src/app/shared/_models/resource-type.model';
import { ResourceTemplate } from 'src/app/shared/_models/resource-template.model';
import { TranslateService } from '@ngx-translate/core';
import { ResourcesService } from 'src/app/shared/_services/resources.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-resource-list-map',
  templateUrl: './resource-list-map.component.html',
  styleUrls: ['./resource-list-map.component.scss']
})
export class ResourceListMapComponent {
  @Input() list: any;
  @ViewChild('pop', { static: false }) pop: ElementRef;


  map: Map;

  private ngUnsubscribe = new Subject<void>();

  dataLoaded=false;

  domainId: string = null;
    categoryId: string = null;
    resourceTypeId: string = null;

    currentLanguage: string = null;

    resourceTypeData: ResourceType = null;

    resourceList:any;

    resourceTemplate: ResourceTemplate = null;
    resourcesCoorinateList=[];

    geometryPointsList=[];

  resourcesList: Resource[] = [];
  modelCard=[];
  // points:Array<Feature>=[];


  constructor(private resourcesService: ResourcesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private resourceFilterService: ResourceFilterService) {
  }

  points=this.data.coordinate;
  coordData=this.data.resourceCoordinatesData;
  filterData=this.data.filterData;

  ngOnInit(): void {
    this.initMap();
    console.log('punteleeee', this.points);
    console.log('coordData', this.coordData);
    console.log('datele din filtruu', this.filterData);

  }

  initMap() {
    const container=document.getElementById('popup');
    const content=document.getElementById('popup-content');
    const closer=document.getElementById('popup-closer');

    //popup
    // const overlay=new Overlay({
    //   element:container,
    //   autoPan: true,
    //   positioning: 'center-center',
    //   stopEvent: false,

    // });

    const straitSource = new VectorSource({ wrapX: true });


// Check if geographical coordinates are null
    if (
        this.filterData.geographicalCoordinates === null ||
        this.filterData.geographicalCoordinates?.longitude === null ||
        this.filterData.geographicalCoordinates?.latitude === null
    ) {
      // If coordinates are null, set default center and zoom for the world map
      this.map = new Map({
        view: new View({
          center: fromLonLat([0, 0]), // Center at (0, 0) for the world map
          zoom: 2, // Adjust the zoom level as needed
        }),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: straitSource,
          }),
          new VectorLayer({
            source: new VectorSource({
              features: this.points,
            }),
            style: new Style({
              text: new Text({
                text: '\uf3c5',
                font: '900 35px "Font Awesome 5 Free"',
                textBaseline: 'bottom',
                fill: new Fill({
                  color: 'red',
                }),
              }),
            }),
          }),
        ],
        controls: [new FullScreen()],
      });
    } else {
      // If coordinates are not null, use the provided coordinates
      this.map = new Map({
        view: new View({
          center: fromLonLat([
            this.filterData.geographicalCoordinates.longitude,
            this.filterData.geographicalCoordinates.latitude,
          ]),
          zoom: 13,
        }),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: straitSource,
          }),
          new VectorLayer({
            source: new VectorSource({
              features: this.points,
            }),
            style: new Style({
              text: new Text({
                text: '\uf3c5',
                font: '900 35px "Font Awesome 5 Free"',
                textBaseline: 'bottom',
                fill: new Fill({
                  color: 'red',
                }),
              }),
            }),
          }),
        ],
        controls: [new FullScreen()],
      });
    }


    const popup = new Overlay({
        element: container,
        autoPan: true,

    });
    this.map.addOverlay(popup);

// display popup on click

      this.map.on('click', function(e){

        const feature = this.forEachFeatureAtPixel(e.pixel, function (feat, layer) {
          return feat;
      }
      );

      if (feature && feature.get('type') === 'Point') {
        const coordinate = e.coordinate;    //default projection is EPSG:3857 you may want to use ol.proj.transform

        content.innerHTML = feature.get('desc');
        popup.setPosition(coordinate);
    }
    else {
        popup.setPosition(undefined);

    }
    });

      closer.onclick=function(){
        popup.setPosition(undefined);
        closer.blur();
        return false;
      };
  }

  ngAfterViewInit(): void {
    console.log("in ngAfterViewInit")
      if (this.map) {
        this.map.setTarget('ol-map');
      }
}

  ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }

}
