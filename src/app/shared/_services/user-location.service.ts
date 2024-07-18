import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {City} from "../_models/city.model";
import {switchMap, take, takeUntil} from "rxjs/operators";
import {User} from "../_models/user.model";
import {tap} from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ConfirmLocationComponent} from "../../standalone-components/confirm-location/confirm-location.component";
import {ToastService} from "./toast.service";
import {TranslateService} from "@ngx-translate/core";
import { DenyLocationComponent } from 'src/app/standalone-components/deny-location/deny-location.component';
import { SuggestedGPSLocationComponent } from 'src/app/standalone-components/suggested-gps-location/suggested-gps-location.component';

@Injectable({
  providedIn: 'root'
})
export class UserLocationService {

  private detectedCity: City;
  private currentUser: User;

  constructor(private http: HttpClient,
              private ngbModal: NgbModal,
              private toastService: ToastService,
              private translate: TranslateService) { }

  checkUserCoordinates() {
    console.log('daca locatia este activa ajungem aici');
    
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition( position => {
          this.findClosestCity(position.coords.latitude, position.coords.longitude)
              .pipe(
                  tap(city => this.detectedCity = city),
                  take(1),
                  switchMap(() => this.getCurrentUser())
              )
              .subscribe({
                next: user => {
                  if (user) this.currentUser = user;
  
                  // daca userul nu are city salvat sau daca difera fata de cel detectat
                  if (!user.city || (user.city !== this.detectedCity.name || user.country !== this.detectedCity.country)) {
                    const modalRef = this.ngbModal.open(ConfirmLocationComponent, {centered: true, size: 'sm', backdrop: 'static'});
                    modalRef.componentInstance.detectedCity = this.detectedCity;
                    modalRef.componentInstance.hasCity = user.city;
                    modalRef.closed
                        .pipe(take(1))
                        .subscribe({
                          next: res => {
                            this.updateCurrentUser({
                              ...this.currentUser,
                              city: res?.location,
                              country: res?.country,
                              currentGeographicalCoordinates: res?.geographicalCoordinates
                            })
                            .pipe(take(1))
                            .subscribe({
                              next: res => {
                                if (res.success) {
                                  console.log('locatia a fost mofificata',res);
  
                                 //this.toastService.showToast(
                                      // this.translate.instant("TOAST.SUCCESS"),
                                      // 'Successfully updated your location',
                                      // "success"
                                      //);
                                }
                              },
  
                              error: () => {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                              }
                            });
                          }
                        });
                  }
                }
              });
        },(error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // User denied access to their location
            console.log('User denied access to location');
            this.getCurrentUser()
           .subscribe((user:User) => {
             if (user) this.currentUser = user;
              if(!user.city){

              const modalRef = this.ngbModal.open(DenyLocationComponent, {centered: true, size: 'sm', backdrop: 'static'});
              // modalRef.componentInstance.detectedCity = this.detectedCity;
              modalRef.componentInstance.userData = user;
              modalRef.closed
                  .pipe(take(1))
                  .subscribe({
                    next: res => {
                      this.updateCurrentUser({
                        ...this.currentUser,
                        city: res?.location,
                        country: res?.country,
                        currentGeographicalCoordinates: res?.geographicalCoordinates
                      })
                      .pipe(take(1))
                      .subscribe({
                        next: res => {
                          if (res.success) {
                            console.log('locatia a fost mofificata',res);

                            //this.toastService.showToast(
                                // this.translate.instant("TOAST.SUCCESS"),
                                // 'Successfully updated your location',
                                // "success"
                                //);
                          }
                        },

                        error: () => {
                          this.toastService.showToast(
                              this.translate.instant("TOAST.ERROR"),
                              this.translate.instant("TOAST.SERVER-ERROR"),
                              "error");
                        }
                      });
                    }
                  });

              }else{
                this.ngbModal.open(SuggestedGPSLocationComponent, {centered: true, size: 'sm', backdrop: 'static'});
              }
              
           })


          } else {
            // Handle other errors
            console.log('Error occurred while retrieving location:', error.message);
          }}
        );
  
        
      }
   

      const permissionStatus = navigator?.permissions?.query({name: 'geolocation'})
      // const hasPermission = permissionStatus?.state // Dynamic value
      console.log('permission status', permissionStatus);
  }

  findClosestCity(latitude: number, longitude: number) {
    return this.http.post<City>('/bestinform/findClosestCity?latitude=' + latitude + '&longitude=' + longitude, {});
  }

  getCurrentUser() {
    return this.http.get<User>('/bestinform/getCurrentUser');
  }

  updateCurrentUser(user: User){
    return this.http.put<{success: boolean; reason: string;}>("/bestinform/updateCurrentUser", user);
  }
}
