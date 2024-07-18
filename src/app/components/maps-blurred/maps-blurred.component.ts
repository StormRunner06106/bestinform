import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { forkJoin, Subject, switchMap, take } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";

import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

import { BlockScrollStrategy, Overlay } from "@angular/cdk/overlay";
import { ResourceListMapComponent } from "src/app/features/domain-listing/_components/resource-list-map/resource-list-map.component";

export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
  return () => overlay.scrollStrategies.block();
}
@Component({
  selector: "app-maps-blurred",
  templateUrl: "./maps-blurred.component.html",
  styleUrls: ["./maps-blurred.component.scss"],
})
export class MapsBlurredComponent implements OnDestroy {
  @ViewChild("resourcesList") resourcesListRef: ElementRef;

  map: google.maps.Map;
  private ngUnsubscribe = new Subject<void>();
  selectedCity: any;
  points = [];
  coordinatesData = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private matDialog: MatDialog,
    private overlay: Overlay
  ) {}




  openMap() {
    this.matDialog.open(ResourceListMapComponent, {
      width: "100%",
      height: "90%",
      panelClass: "map-dialog",
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data: {
        coordinate: this.points,
        resourceCoordinatesData: this.coordinatesData,
        filterData: this.selectedCity,
      },
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
