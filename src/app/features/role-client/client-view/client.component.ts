import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatLegacyMenuTrigger as MatMenuTrigger} from '@angular/material/legacy-menu';
import {FriendRequestService} from 'src/app/shared/_services/friendRequest.service';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {User} from "../../../shared/_models/user.model";
import {OwlOptions} from "ngx-owl-carousel-o";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {share, Subject, takeUntil} from 'rxjs';
import {ReservationsComponent} from '../../reservations/reservations.component';
import {ReservationsService} from 'src/app/shared/_services/reservations.service';
import {Reservation} from 'src/app/shared/_models/reservation.model';
import {TranslateService} from "@ngx-translate/core";
import {SharedExperience} from "../../../shared/_models/shared-experience.model";
import {SharedExperiencesService} from "../../../shared/_services/shared-experiences.service";
import {ItinerariesService} from "../../itineraries/_services/itineraries.service";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {ActivatedRoute} from "@angular/router";
import fileSaver from "file-saver";
import {SmartBillService} from "../../../shared/_services/smartbill.service";

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit, OnDestroy {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    // initial filter numbers
    pageNumber = 0;
    pageSize = 9
    pageSizeArray = [1, 9, 27, 102];
    sorting = "date";
    dir = 'desc';
    //total elements
    totalSharedExperiences: number;
    totalAppliedJobs: number;
    totalMyCourses: number;

    clientInfo: User;
    isClient: boolean;

    //friends
    acceptedFriendsList = [];
    accFriendList = [];

    //friends request
    requestList = [];
    pendingFriendList = [];

    //size of friends requests list
    lengthRequests: number;
    requestId: string;
    rejectReqId: string;
    deleteReqId: string;


    resourcesList = [];
    currentLanguage: string;
    // my experiences
    experiencesList: Array<Reservation> = [];
    // shared experiences
    sharedExperiencesList: Array<SharedExperience> = [];

    //jobs
    jobsList: Array<Reservation> = [];
    coursesList: Array<Reservation> = [];

    itinerariesList: Itinerary[];

    // we use this to select other outer tabs on component init
    selectedOuterTab = 0;
    selectedChildOuterTab = 0;


    // carousel config
    customOptions: OwlOptions = {
        loop: false,
        mouseDrag: true,
        touchDrag: true,
        pullDrag: false,
        // dots: true,
        // dotsEach: 4,
        // nav: true,
        navSpeed: 700,
        navText: ['<', '>'],
        // center: true,
        // margin: 24,
        responsive: {
            0: {
                items: 1
            },
            576: {
                autoWidth: true,
                items: 2
            },
            768: {
                items: 3
            },
            992: {
                items: 4
            },
            1200: {
                items: 5
            }
        }
    }

    private ngUnsubscribe = new Subject<void>();


    constructor(
        private firendRequestService: FriendRequestService,
        private toastService: ToastService,
        private userService: UserDataService,
        private cdr: ChangeDetectorRef,
        private resourceService: ResourcesService,
        private translate: TranslateService,
        private reservationService: ReservationsService,
        private sharedExperienceService: SharedExperiencesService,
        private itinerariesService: ItinerariesService,
        private smartBillService: SmartBillService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.checkForQueryParams();
        this.resourcesList = [];

        // this.initiateData();
        this.checkForLanguage();
        this.getClientData();

        // Listen to List Changes
        this.listChanges();
    }

    checkForQueryParams() {
        this.route.queryParamMap
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: params => {
                    if (!params) return;

                    if (params.has('tab')) {
                        if (params.get('tab') === 'favorites') {
                            this.selectedOuterTab = 1;
                        } else if (params.get('tab') === 'friends') {
                            this.selectedOuterTab = 4;
                        } else if (params.get('tab') === 'courses') {
                            this.selectedOuterTab = 0;
                            this.selectedChildOuterTab = 4;
                        }
                    }
                }
            })
    }

    getClientData() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.clientInfo = res;
                    console.log('client', res);
                    if (res.roles.includes("ROLE_CLIENT")) {
                        this.isClient = true;
                    }

                    if (this.clientInfo) {
                        this.initiateData();
                    }
                    // console.log('RES', this.clientInfo);

                }
            })


    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize

        // Get All Documents List
        this.initiateData();
    }

    checkForLanguage() {
        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });
    }

    getFavouriteResources() {
        this.resourceService.getMyFavoritesResources('ro').subscribe((resList: any) => {
            resList.forEach((resourceCateg: any) => {
                resourceCateg.resources.forEach((res: any) => {
                    this.resourcesList.push(res);
                })
            })
        })
    }

    //initialize data
    initiateData() {
        this.getFriends();
        this.getFriendRequest();
        this.getReservationList();
        this.getItineraries();
        this.getSharedExperiencesList();
        this.getFavouriteResources();
        this.getJobsList();
        this.getCoursesList();

        // Change Detection
        this.cdr.detectChanges();
    }


    getItineraries() {
        console.log('get iti 1');

        const filterItinerary = {
            status: 'clientItinerary',
            userId: this.clientInfo.id
        }

        this.itinerariesService.listItinerariesFiltered(0, -1, 'date', 'desc', filterItinerary).subscribe((resp: any) => {
            console.log('resp it', resp);
            this.itinerariesList = resp.content;
        })
    }

    getFriends() {
        const filterObject = {
            status: "accepted"
        };

        this.firendRequestService.listMyFriend(this.pageNumber, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {

            this.acceptedFriendsList = res["content"];

            this.acceptedFriendsList.forEach(element => {
                this.userService.getUserById(element.senderId).subscribe((userDate: User) => {
                    //populate list with friends
                    this.accFriendList.push(userDate);
                });
            });
            console.log('acc friends', this.accFriendList);
        });
    }

//get friends request
    getFriendRequest() {
        const filterObject = {
            status: "pending"
        };

        this.firendRequestService.listMyFriend(this.pageNumber, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {

            this.requestList = res["content"];
            // console.log(this.requestList);

            this.lengthRequests = res["content"].length;
            this.requestList.forEach(element => {

                this.userService.getUserById(element.senderId).subscribe((userDate: User) => {
                    //populate list with friends
                    this.pendingFriendList.push(userDate);
                });
            });

        });
    }

//accept friend request
    acceptFriendRequest(friendId: string) {


        this.requestList.forEach(element => {

            if (element.senderId === friendId) {
                this.requestId = element.id;
            }
        });


        this.firendRequestService.acceptFriendRequest(this.requestId, {}).subscribe(() => {

            this.firendRequestService.triggerListChanges(true);
            // console.log("trigger accept");
            // Set Message & Response
            this.toastService.showToast('Succes', 'Felicitari! Acum sunteti prieteni!', 'success');

        }, () => {
            this.toastService.showToast('Eroare', 'Ups! A aparut o eroare!', 'error');

        });


    }


//accept friend request
    rejectFriendRequest(friendId: string) {

        this.requestList.forEach(element => {
            if (element.senderId === friendId) {
                this.rejectReqId = element.id;
            }
        });

        this.firendRequestService.rejectFriendRequest(this.rejectReqId, {}).subscribe(() => {

            this.firendRequestService.triggerListChanges(true);
            // console.log("trigger reject");
            // Set Message & Response
            this.toastService.showToast('Succes', 'Cerere respinsa!', 'success');

        }, () => {
            this.toastService.showToast('Eroare', 'Ups! A aparut o eroare!', 'error');

        });
    }

//delete friend request
    deleteFriend(friendId: string) {

        this.acceptedFriendsList.forEach(element => {
            if (element.senderId === friendId) {
                this.deleteReqId = element.id;
            }
        });

        this.firendRequestService.deleteFriend(this.deleteReqId).subscribe(() => {

            this.firendRequestService.triggerListChanges(true);
            // console.log("trigger delete");
            // Set Message & Response
            this.toastService.showToast('Succes', 'Prieten sters cu succes!', 'success');

        }, error => {
            console.log(error);
            this.toastService.showToast('Eroare', 'Ups! A aparut o eroare!', 'error');
        });
    }

//get the last 3 reservation, for my Experiences tab
    getReservationList() {

        const bookingObject = {
            userId: this.clientInfo.id,
            bookingTypes: ['rentalBooking', 'serviceBookingTimeSlots', 'ticketBooking', 'carBooking', 'culturalBooking', 'menu']
        }

        this.reservationService.listReservationFiltered(0, 3, 'date', 'desc', bookingObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.experiencesList = bookings.content;
                    console.log('BOOKING LIST', this.experiencesList);
                }
            });
    }

//get the last 3 reservation, for my Experiences tab
    getJobsList() {

        const bookingObject = {
            userId: this.clientInfo.id,
            bookingTypes: ['applyToJob']
        }

        this.reservationService.listReservationFiltered(this.pageNumber, this.pageSize, 'date', 'desc', bookingObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.jobsList = bookings.content;
                    console.log('jobs LIST', this.jobsList);
                    this.totalAppliedJobs = bookings.totalElements;
                }
            });
    }

    getSharedExperiencesList() {
        const filterObj = {
            participants: [this.clientInfo.id]
        };

        this.sharedExperienceService.listSharedExperiencesFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filterObj)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (sharedExp: any) => {
                    console.log('SHARED EXP', sharedExp.content);
                    this.sharedExperiencesList = sharedExp.content;
                    this.totalSharedExperiences = sharedExp.totalElements;
                }
            })

    }

    //get courses
    getCoursesList() {

        const bookingObject = {
            userId: this.clientInfo.id,
            bookingTypes: ["productsList", "culturalBooking"]
        }

        this.reservationService.listReservationFiltered(this.pageNumber, this.pageSize, 'date', 'desc', bookingObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.coursesList = bookings.content;
                    this.totalMyCourses = bookings.totalElements;
                    console.log('CURSURRIIIIII', this.coursesList);
                }
            });
    }

    // Listen to data changes and refresh the user list
    listChanges() {
        this.firendRequestService.listChangedObs.subscribe((data: boolean) => {
            this.accFriendList = [];
            this.pendingFriendList = [];
            // If the response is true
            if (data) {
                // Get Documents List
                this.getFriends();
                this.getFriendRequest();

                this.firendRequestService.triggerListChanges(false);
                // console.log("trigger fals");
            }
            // this.cdr.detectChanges();// Reset Obs Trigger
        })
    }

// Trigger Feedback Message Service
    feedbackTriggered() {
        this.toastService.toastEvents.subscribe((data: boolean) => {

            if (data) {
                // Scroll Top
                window.scrollTo({top: 0, behavior: 'smooth'});

                // Listen to layout changes
                this.cdr.detectChanges();
            }
        })
    }

    downloadBill(series: string, number: string) {
        if (!series || !number) {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
            return;
        }

        this.smartBillService.downloadFile(series, number).subscribe((file: any) => {
            const fileName = 'Factura-Rezervare.pdf';
            const blob = new Blob([file], {type: 'text/json; charset=utf-8'});
            fileSaver.saveAs(blob, fileName);

        }, () => {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}
