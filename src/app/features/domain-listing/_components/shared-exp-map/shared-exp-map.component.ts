import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { Subject } from 'rxjs';

@Component({
  selector: 'app-shared-exp-map',
  templateUrl: './shared-exp-map.component.html',
  styleUrls: ['./shared-exp-map.component.scss']
})
export class SharedExpMapComponent {
  experienceData= this.data.experienceData;
 

  map: Map;
  isValidCoords = false;
  private ngUnsubscribe = new Subject<void>();


  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: any,
    ){}

    ngOnInit(){

      console.log('din modalul shared exp',this.experienceData);

      this.checkCoordinates();

      
    }

    checkCoordinates(){
      const lat = this.experienceData?.geographicalCoordinates?.latitude;
      const long = this.experienceData?.geographicalCoordinates?.longitude;
      console.log('aici verificam coordonatele', lat, long);

      // if (lat && long && lat >= -90 && lat <= 90 && long >= -180 && long <= 180) {
      //   this.isValidCoords = true;
        this.initMap();
      // }
    }

      initMap() {
        console.log('se initializeaza map-ul');

        const resourceFeature = new Feature({
            geometry: new Point(fromLonLat([
                +this.experienceData.geographicalCoordinates.longitude,
                +this.experienceData.geographicalCoordinates.latitude
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
                    +this.experienceData.geographicalCoordinates.longitude,
                    +this.experienceData.geographicalCoordinates.latitude]),
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
      console.log('se seteaza mark-up-ul');
        if (this.map) {
            this.map.setTarget('ol-map');
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
