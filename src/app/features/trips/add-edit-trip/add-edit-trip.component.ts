import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {LocationsService} from "../_services/locations.service";
import { ToastService } from 'src/app/shared/_services/toast.service';
import { Subject, find, takeUntil } from 'rxjs';
import { Country } from 'src/app/shared/_models/country.model';
import {Location} from "../../../shared/_models/location.model";
import * as moment from "moment";
import { MatAccordion } from '@angular/material/expansion';
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import { DatePipe } from '@angular/common';
import { error } from 'node:console';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ResourcesService } from 'src/app/shared/_services/resources.service';


@Component({
  selector: 'app-add-edit-trip',
  templateUrl: './add-edit-trip.component.html',
  styleUrls: ['./add-edit-trip.component.scss'],
  providers: [ModalMediaService, DatePipe]

})
export class AddEditTripComponent {

  private ngUnsubscribe = new Subject<void>();

  //accordion for gallery
  @ViewChild(MatAccordion) accordion: MatAccordion;

  isEditMode=false;
  addEditTripForm: FormGroup;
  statusForm:FormControl;
  // hotelList:FormGroup;

  currentDay:any;

  //list of countries
  countriesList:Array<Country>=[];
  //list of destinations / locations
  locationsList:Array<Location>=[];
  accommodationTypeList=[];

  //edit trip
  tripId:string;
  tripData:any;
  startDate:string;
  endDate:string;
  slug:string;
  // editRoomsArray=[];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private translate: TranslateService,
    private locationService: LocationsService,
    private modalMediaService: ModalMediaService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router
    ){
  }

  ngOnInit():void{
    this.getPathSlug();
    this.initFormGroup();
    this.listenToMedia();
  }

  //init form
  initFormGroup(){
    this.addEditTripForm =this.fb.group({
      //general info
      name: ['', [Validators.required]],
      countryId:['',[Validators.required]],
      locationId:['', [Validators.required]],
      startDate:['',[Validators.required]],
      endDate:['',[Validators.required]],
      description:[''],
      estimatedPrice:[''],
      featuredImage: [null],
      images: [[]],

      //accomodation
      accommodationType:[''],
      // nights:[''],
      offerPackage:[''],
      // attributes:[''],//de verificat
       //plecare

      //transportation
      transportType:[''],
      departure:this.fb.group({
        location: ['', Validators.required],
        start: [''],
        end: [''],
      }),
      arrival: this.fb.group({
        location:  ['', Validators.required],
        start:  [''],
        end:  [''],
      }),
      hotelList: this.fb.group({
        hotelName: ['',Validators.required],
        hotelAddress:['',[Validators.required]],
        starRating: ['',[Validators.required] ],
        rooms: this.fb.array([])
      }),

    //   hotelList: this.fb.array([
    //     this.fb.group({
    //       hotelName: ['',Validators.required],
    //       rooms: this.fb.array([])
    //     })
    // ]),
         //tourism recommendation
         recommendation:[''],
    });

    this.statusForm= new FormControl('');

    //get countries
    this.getCountriesList();
    //get current date for time picker
    this.currentDay = new Date();
  }

    //get the editorial slug from url
    getPathSlug() {
      this.route.params.subscribe(params => {
          this.tripId = params['tripId'];
          console.log('SLUG',this.tripId);
          //get editorial by slug
          if (this.tripId !== undefined) {
              this.isEditMode = true;
              this.getTripById(this.tripId);
          }else{
              console.log('NU AM SLUG');
          }
      });
  }

  //populate countries select list
  getCountriesList(){
    this.locationService.getCountryList()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res)=>{
        this.countriesList=res;
      }
    });
  }

  //on country select, call getLocationListByCountryId(country)
  getLocationListByCountryId(event?){

    if(!this.isEditMode){

      if(event.isUserInput) {
        this.locationsList=[];

        this.locationService.getLocationListByCountryId(event.source.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res)=>{
            res.forEach(location => {
              if(location.countryId === event.source.value){
                this.locationsList.push(location);
              }
            });
          }});
        }
    }else{
      //if edit mode
      this.locationService.getLocationListByCountryId(this.tripData?.countryId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res)=>{
          this.locationsList=[];
          res.forEach(location => {
            if(location.countryId === this.tripData.countryId){
              this.locationsList.push(location);
            }
          });
        }});
    }
  }

  //get trip by id to edit
  getTripById(tripId){
    this.locationService.getTripById(tripId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(res:any)=>{
        console.log('tripul de modificat',res);
        this.tripData=res;
        this.getLocationListByCountryId();
        this.addEditTripForm.patchValue(this.tripData);
        this.addEditTripForm.get('hotelList').patchValue(this.tripData.hotelList[0]);
        this.statusForm.patchValue(this.tripData.status);
        this.slug= this.tripData.slug;

        if (this.tripData.hotelList[0].rooms) {
          this.tripData.hotelList[0].rooms.forEach(room => {
              this.rooms.push(
                  this.fb.group({
                    name: [room.name],
                    image: [room.image],
                    people:[ room.people],
                    bedType: this.fb.group({
                      type: [room.bedType.type],
                      quantity: [room.bedType.quantity],
                  }),
                    available: [room.available],
                    price: [room.price]
                  })
              );
          });
        }
      }
    });

  }

    //rooms array
    get rooms(): FormArray {
      return this.addEditTripForm.get('hotelList.rooms') as FormArray;
    }

    //item to add in room array
    newItem(): FormGroup {
      return this.fb.group({
          name: [null, Validators.required],
          image: null,
          people: 0,
          bedType: this.fb.group({
            type: [''],
            quantity: 0
        }),
          available: 0,
          price: 0
      })
    }

    //add new room button
    addItem() {
      this.rooms.push(this.newItem());
    }

    //remove room
    removeItem(index: number) {
      this.rooms.removeAt(index);
    }

    //get media
  listenToMedia() {
    this.modalMediaService.currentImagesArray
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((array: any) => {
          console.log('array media', array);
          if(array.length) {
            if (array?.[0]?.for === 'trip-featuredImg') {
              this.addEditTripForm.get('featuredImage').setValue(array[0].selectedMedia);
            }else if (array?.[0]?.for?.includes('roomFeaturedImg')) {
              const roomIndex = array?.[0]?.for.split('-')[1];
              this.rooms.controls[roomIndex].get('image').setValue(array[0].selectedMedia);
            } else {
              this.addEditTripForm.get('images').setValue(array);

            }
          }


        });
      }
      // delete image
      removeImage(imageIndex: number): void {
        const modifiedImgArray = this.addEditTripForm.get('images').value.slice();
        modifiedImgArray.splice(imageIndex, 1);
        this.modalMediaService.changeImageArray(modifiedImgArray);
    }
    //media modal
    openMedia(content: TemplateRef<unknown>) {
        // this.modalMediaService.sendImagesToService([this.domainImagesForm.value]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    updateTrip(tripId, trip){
      console.log(trip);

      const updateTrip={
        ...trip,
        slug: this.slug,
        status: this.statusForm.value
      }

      this.locationService.updateTrip(tripId,updateTrip)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res:any)=>{
        if(res.success){
          //list changed
          this.toastService.showToast("Succes", "Trip editat cu succes!", "success");
          this.router.navigate(['../../list'], { relativeTo: this.route });
        }
      }, error=>{
        console.log(error);
        this.toastService.showToast("Eroare", "A aparut o problema!", "error")
      });

    }

    changeTripStatus(status){
      this.locationService.changeTripStatus(this.tripId,status)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res:any)=>{
        if(res.success){
          this.toastService.showToast("Succes", "Status editat cu succes!", "success")
        }
      },error=>{
        console.log(error);
        this.toastService.showToast("Eroare", "A aparut o problema!", "error")
      });
    }

    createTrip(trip){
      const tripWithStatus={
        ...trip,
        status:"pending_review",
        currency: "EUR"
      }

      console.log('form trip', tripWithStatus)

      // console.log(tripWithStatus);
      this.locationService.addTrip(tripWithStatus)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any)=>{
          if(res.success){
            this.toastService.showToast("Succes", "Trip creat cu succes!", "success");
            this.router.navigate(['../../list'], { relativeTo: this.route });
          }
        },error:()=>{
          this.toastService.showToast("Eroare", "A aparut o problema!", "error")
      }
      });

    }

  submitEvent(){
    //de verificat daca e valid
    this.addEditTripForm.markAllAsTouched();

    this.startDate=this.datePipe.transform(this.addEditTripForm.get('startDate').value ,'yyyy-MM-dd');
    this.endDate=this.datePipe.transform(this.addEditTripForm.get('endDate').value ,'yyyy-MM-dd');

    // const trip=this.addEditTripForm.value;
    const trip={
      name: this.addEditTripForm.get('name').value,
      countryId:this.addEditTripForm.get('countryId').value,
      locationId:this.addEditTripForm.get('locationId').value,
      startDate:this.startDate,
      endDate:this.endDate,
      // startDate:this.addEditTripForm.get('startDate').value,
      // endDate:this.addEditTripForm.get('endDate').value,
      description:this.addEditTripForm.get('description').value,
      featuredImage: this.addEditTripForm.get('featuredImage').value,
      images: this.addEditTripForm.get('images').value,
      transportType:this.addEditTripForm.get('transportType').value,
      departure:this.addEditTripForm.get('departure').value,
      arrival:this.addEditTripForm.get('arrival').value,
      hotelList: [this.addEditTripForm.get('hotelList').value],
      accommodationType:this.addEditTripForm.get('accommodationType').value,
      offerPackage:this.addEditTripForm.get('offerPackage').value,
      recommendation:this.addEditTripForm.get('recommendation').value,
      estimatedPrice:this.addEditTripForm.get('estimatedPrice').value
    }

    if (this.addEditTripForm.valid) {
      //edit mode
      if(this.isEditMode){
        this.updateTrip(this.tripId, trip);
        console.log('ID din Edit mode', this.tripId);
        console.log('Trip din trip mode', trip);

      }else{
        //create mote
        this.createTrip(trip);
      }
    }else{
      console.log('formularul nu e valid');
    }
  }



  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
