import { Component, OnInit } from '@angular/core';
import {Observable, switchMap} from "rxjs";
import {Resource} from "../../../shared/_models/resource.model";
import {ActivatedRoute, Router} from "@angular/router";
import {EventsService} from "../../../shared/_services/events.service";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {filter, map} from "rxjs/operators";
import {ResourceFilterService} from "../../../shared/_services/resource-filter.service";

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss']
})
export class ViewEventComponent implements OnInit {

  eventData: Resource;

  $otherEvents: Observable<Resource[]>;

  dataIsLoaded = false;

  selectedImage: string;

  // event attributes
  eventBenefits = [];
  allBenefits: string[] = ['Parcare gratuita', 'Aer conditionat', 'Bauturi gratis', 'Cabina foto', 'Candy bar'];
  startTime: string | number | boolean;
  endTIme: string | number | boolean;

  domainId: string;
  categoryId: string;
  resourceTypeId: string;
  eventId: string;

  domain: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private eventsService: EventsService,
              private resourceFilterService: ResourceFilterService,
              private resourceService: ResourcesService) { }

  ngOnInit(): void {
    this.getEventData();
  }

  getEventData() {
    this.route.paramMap.pipe(
        switchMap((params: any) => {
          if(params.get('id')) {
            return this.eventsService.getResourceBySlug(params.get('id'));
          } else {
            this.router.navigate(['private']);
          }
        })
    ).subscribe( (event: Resource) => {
      this.eventData = event;

      this.$otherEvents = this.eventsService
          .listResourceFiltered(0, 5, null, null, {
            categoryId: this.eventData.categoryId,
            status: 'active'
          })
          .pipe(
              map(pagination => pagination.content.filter(resource => resource.id !== this.eventData.id))
          );

      console.log('event data',this.eventData);
      this.getDomain(event.domain);
      this.domainId = event.domain;
      this.categoryId = event.categoryId;
      this.resourceTypeId = event.resourceTypeId;
      this.eventId = event.id;

      if (event.images) {
        this.selectedImage = event.images[0].filePath;
        console.log(this.selectedImage);
      }

      /*if (event.attributes) {
        event.attributes.forEach(attribute => {
          if (this.allBenefits.includes(attribute.attributeName) && attribute.attributeValue) {
            this.eventBenefits.push(attribute.attributeName);
          }
          if (attribute.attributeName === 'Data de inceput') {
            this.startTime = attribute.attributeValue;
            console.log(this.startTime);
          }
          if (attribute.attributeName === 'Data de sfarsit') {
            this.endTIme = attribute.attributeValue;
            console.log(this.endTIme);
          }
        });
      }*/

      this.dataIsLoaded = true;

    }, () => {
      this.router.navigate(['private']);
    });
  }

  navigateToEventsTicket(){
    // resetam valorile din serviciu
    this.resourceFilterService.initServiceStates();
    this.router.navigate(['client/domain', this.domainId,'category', this.categoryId,'resource-type',this.resourceTypeId,'view', this.eventId],{ queryParams: { book: 'ticket' } })
  }

  getDomain(domainId: string){
    this.resourceService.getDomainById(domainId)
        .subscribe({
          next:(domain:any)=> {
            this.domain =  domain?.nameEn;
          }
        })
  }

  changeImage(filePath) {
    this.selectedImage = filePath;
  }

}
