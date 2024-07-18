import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { PaginationResponse } from 'src/app/shared/_models/pagination-response.model';
import { ResourceFilterService } from 'src/app/shared/_services/resource-filter.service';
import { ResourcesService } from 'src/app/shared/_services/resources.service';
// import { slideAnimation } from 'src/app/utils/animations';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  // animations: [slideAnimation]
})
export class ModalComponent implements OnInit {
  @Input() isVisible = true;
  @Input() title = 'Modal Title';
  @Input() type = '';

  message = 'Modal Message';

  searchInput;
  typingTimeout: any = null;

  restaurants = [];
  display: any;
  center: google.maps.LatLngLiteral = {
      lat: 44.4268,
      lng: 26.1025
  };
  zoom = 12;


  constructor(
    private resourceService: ResourceFilterService,
    private router: Router
  ) { 
  
   }

   onUserType() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  
    this.typingTimeout = setTimeout(() => {
      this.onUserStoppedTyping(); 
    }, 500);
  }

  onUserStoppedTyping() {
    console.log("User stopped typing. Executing function...");
    this.resourceService.getRestaurants(10).subscribe((res) => {
      this.restaurants = res;
    });
  }


  navigateToRestaurant(restaurant) {
    const url = ['/client/domain/63bfcca765dc3f3863af755c/category/63dbb183df393f737216183c/resource-type/63dbb18cdf393f737216183d/view', restaurant.id];
    this.isVisible = false;
    this.router.navigate(url);
  }


  @Output() closeModal = new EventEmitter<boolean>();


  ngOnInit() {
    console.log('modal type', this.type);
  }

  close() {
    this.closeModal.emit(true);
  }

  moveMap(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  move(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.display = event.latLng.toJSON();
  }





}