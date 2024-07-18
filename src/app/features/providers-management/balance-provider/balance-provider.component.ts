import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { Domains } from 'src/app/shared/_domains';
import { ResourcesService } from 'src/app/shared/_services/resources.service';

//
import { FormControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatPaginatorModule} from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import {ChartComponent} from "ng-apexcharts";

import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { TransactionList } from 'src/app/shared/_models/transaction.model';

import { DatePipe, DecimalPipe } from '@angular/common';
import { ViewPaymentRequestComponent } from '../view-payment-request/view-payment-request.component';
import { PaymentRequestComponent } from '../payment-request/payment-request.component';
import { SettingsService } from 'src/app/shared/_services/settings.service';
@Component({
  selector: 'app-balance-provider',
  templateUrl: './balance-provider.component.html',
  styleUrls: ['./balance-provider.component.scss'],
  providers:[Domains, DatePipe, DecimalPipe]
})
export class BalanceProviderComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild("chart") chart: ChartComponent;

  //for resources card
  providerId:string;
  companyName:string;
  county:string;
  city:string;
  coverImagePath:string;
  domain:string;
  //balance
  allMoney: number;
  moneyToReceive: number;
  pendingMoney: number;
  commission: number;
  transactionHistory: number;

  isStaff:boolean;
  isProvider:boolean;
  isAdmin:boolean;

  //transaction list
  resourceNameTransaction:string;
  clientTransaction:string;
  paymentDateTransaction:string;
  amountTransaction:number;
  statusTransaction:string;


  //financial transactions table
  displayedTransactionColumns: string[] = ['id', 'title','client', 'date','totalPrice','status'];
  dataTransactionSource = [];
  transactionList: Array<any>=[]; //de modificat?
  dataTransactionLoaded:boolean

  //financial transactions pagination
  pageTransaction = 0;
  sizeTransaction = 10;
  pageTransactionSizeArray = [10, 25, 100];
  sortingTransaction ='date';
  dirTransaction='desc';
  paginationTransactionInfo:any;

  //resources Type data
  resourceTypeId:string;
  resourceTypeIconPath:string;

  //resources list
  resourcesList:Array<any> = [];
  finalResourcesList = [];

  // chart
  chartOptions:any;

  //payment requests table
  displayedPaymentColumns: string[] = ['id', 'title', 'amount', 'requestDate','status','actions'];
  dataPaymentSource = [];
  paymentRequestsList: Array<any>=[]; //de modificat?
  dataPaymentLoaded:boolean;


  //filter transaction Resources
  pagePayment = 0;
  sizePayment = 10;
  sortingPayment ='requestDate';
  pagePaymentSizeArray = [10, 25, 100];
  dirPayment='desc';
  totalPaymentElements:number;
  paginationPaymentInfo:any;
  //recent transaction
  recentTransactionList:Array<any>=[];

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<', '>'],
      margin: 20,
    autoWidth: true,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }

  currentUser: string;
  currency: string;


  constructor(
    private route: ActivatedRoute,
    private userService:UserDataService,
    private resourcesService:ResourcesService,
    private cdr:ChangeDetectorRef,
    private ngbModal:NgbModal,
    private modalService:ModalService,
    private providersService:ProvidersService,
    private datePipe: DatePipe,
    private settingsService:SettingsService
    //serviciul de adaugare cereri
  ) { }

  ngOnInit(): void {

    this.getCurrentRole();
    // TO DO - de verificat ruta daca are id, daca are populam pagina cu informatii luate din getProviderById, daca nu - din getCurrentUser


    this.getProviderId();

    //resources card

    //payment request list
    this.listChanges();
    //reservation/transaction list
    //last 3 reservation/transaction

    this.chartOptions=this.getChartOptions();

    // this.initiateData();
    // console.log('PROVIDER IDDDDD', this.providerId);
  }

  // Payment Request- Filter Forms
  searchPaymentRequestFilter: FormControl = new FormControl('');

  // financial transactions- Filter Forms
  searchTransactionsFilter: FormControl = new FormControl('');

  //get role
  getCurrentRole(){
    this.userService.getCurrentUser().subscribe((userData:any)=>{

      this.isAdmin=userData.roles.includes('ROLE_SUPER_ADMIN') ? true : false;
      this.isStaff=userData.roles.includes('ROLE_STAFF') ? true : false;
      this.isProvider=userData.roles.includes('ROLE_STAFF') ? true : false;
    })
  }

  //get current user
  getCurrentUser(){
    this.userService.getCurrentUser().subscribe((userData:any)=>{
          this.providerId = userData?.id;
          this.currentUser= userData?.id;
          this.companyName=userData?.companyName;
          this.county=userData?.billingAddress.county;
          this.city=userData?.billingAddress.city;
          this.domain=userData?.domain;
          this.coverImagePath=userData?.coverImage !==null? userData?.coverImage?.filePath: "../../../assets/images/others/coming-soon-min.jpg";

          // balance data
          this.allMoney=userData.earnedMoney?.allMoney;
          this.moneyToReceive=userData.earnedMoney?.moneyToReceive;
          this.pendingMoney=userData.earnedMoney?.pendingMoney;
          this.commission=userData.earnedMoney?.commission;
          this.transactionHistory=userData.earnedMoney?.transactionHistory;

          this.getResourcesList(userData?.id);
          this.getReservation(userData?.id);
          this.getTransactionList();
          this.getPaymentRequestList();
          
    })
  }

  //get the provider's slug from url
  getProviderId() {
      this.route.params.subscribe(params => {
        if(params['id']){
          this.providerId = params['id'];

          if(this.providerId){
            this.getResourcesList(this.providerId);
            this.getProviderById(this.providerId);
            this.getReservation(this.providerId);
            this.getTransactionList();
            this.getPaymentRequestList();
          }
            

          this.getSettings();

        }else{
          this.getCurrentUser();
          this.getSettings();

        }

      });
  }

  //set data
  getProviderById(idProvider){
    this.userService.getUserById(idProvider).subscribe((providerData:any)=>{


        this.companyName=providerData?.companyName;
        this.county=providerData?.billingAddress?.county;
        this.city=providerData?.billingAddress.city;
        this.domain=providerData?.domain;

        // balance data
      this.allMoney=providerData?.earnedMoney?.allMoney;
      this.moneyToReceive=providerData?.earnedMoney?.moneyToReceive;
      this.pendingMoney=providerData?.earnedMoney?.pendingMoney;
      this.commission=providerData?.earnedMoney?.commission;
      this.transactionHistory=providerData?.earnedMoney?.transactionHistory;
    });
  }

  // Listen to data changes and refresh the user list
  listChanges() {
    this.modalService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getPaymentRequestList();

        // Reset Obs Trigger
        this.modalService.triggerUserListChanges(false);
      }
    })
  }

  //to get currency
  getSettings(){
    this.settingsService.getCurrentSettings()
    .subscribe((data:any)=>{
      if(data!==null){
        this.currency= data?.currency !== null ? data?.currency : 'EUR';
      }else{
      this.currency='EUR';
      }
    });
  }

  //get Payment request list
  getPaymentRequestList(){
    const filter={
      name:this.searchPaymentRequestFilter.value !== '' ? this.searchPaymentRequestFilter.value : null,
      userId: this.providerId
    }
    this.providersService.listPaymentRequestFiltered(this.pagePayment, this.sizePayment,this.sortingPayment, this.dirPayment, filter).subscribe((paymentData:any)=>{
      this.paymentRequestsList=paymentData.content;
      this.paginationPaymentInfo=paymentData;
    });
  }

  //GET resources data
  getResourcesList(userId: string){
    const filterObj={
      userId: userId
    }

    this.resourcesService.listResourceFiltered(0,-1,'','',filterObj).subscribe((data:any)=>{

      this.resourcesList=data.content;
      this.resourcesList.forEach((element:any, index:number) => {

        this.resourcesService.getResourceTypeById(element.resourceTypeId).subscribe((data:any)=>{
        this.finalResourcesList.push({
          index:index,
          title: element?.title,
          address: element?.address,
          icon:data?.icon,
          price:element.totalBookingAmount
        });
      });
    });
  });}

  //filtering and sorting
  //search filter
  filterData(){
    // Go to first page
     this.paginator.firstPage();

    //get list
    //  this.getPaymentRequestList();

    //set total of elements
    this.getTransactionList();
 }

//sorting
 applyPaymentFilter(event?){
   if (event) {
     this.dirPayment = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
   }
        // // Listen to layout changes
        this.cdr.detectChanges();

        // // Get All Documents List
         this.getPaymentRequestList();
 }

 applyTransactionFilter(event?){
  if(event){
    this.dirTransaction = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
  }

  this.cdr.detectChanges();

  this.getTransactionList();
 }

  //changed page
  pagePaymentChanged(event?){
      this.pagePayment = event.pageIndex + 1;
      this.sizePayment = event.pageSize;

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getPaymentRequestList();

  }

  pageTransactionChange(event?){
      console.log('Page transaction change');
      this.pageTransaction = event.pageIndex;
      this.sizeTransaction = event.pageSize;

      // Listen to layout changes
      this.cdr.detectChanges();

      const filter={
        resourceName: this.searchTransactionsFilter.value === ''? null :  this.searchTransactionsFilter.value,
        providerId:this.providerId

      };

      this.providersService.listReservationFiltered(this.pageTransaction,this.sizeTransaction,this.sortingTransaction,this.dirTransaction, filter).subscribe((reservationData:any)=>{
        this.transactionList=reservationData.content;
        this.paginationTransactionInfo=reservationData;

      });

  }

  //get transaction list
  getTransactionList(){
    const filter={
      resourceName: this.searchTransactionsFilter.value === ''? null :  this.searchTransactionsFilter.value,
      providerId:this.providerId
    };
    console.log("obiectul din transaction list", filter);
    this.providersService.listReservationFiltered(this.pageTransaction,this.sizeTransaction,this.sortingTransaction,this.dirTransaction, filter).subscribe((reservationData:any)=>{
      this.transactionList=reservationData.content;

      this.paginationTransactionInfo=reservationData;
      console.log('paginatia',this.paginationTransactionInfo);
      console.log('lista in sine',this.transactionList);


    });
  }

  //recent transaction
  getReservation(userId: string){

    const filter={
      providerId: userId
    }

    this.providersService.listReservationFiltered(0 ,3,'date', 'desc', filter).subscribe((list:any)=>{
      this.recentTransactionList=list.content;
    });

    console.log('LISTA REZERVARI RECENTE: ', this.recentTransactionList);
  }

  getResourceById(resourceId){
    this.resourcesService.getResourceById(resourceId).subscribe((resourcesData:any)=>{

      this.resourceNameTransaction=resourcesData.title;
    })
  }
  //chart graph
  getChartOptions(){
    return{
      series: [
        {
          name: "My-series",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 308,
        type: "line"
      },
      xaxis: {
        categories: ["Jan", "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug", "Sep"]
      }
    };
  }

  //modals

   // Modal - Provider Request doc
   paymentRequest(elementId: string) {
    this.ngbModal.open(PaymentRequestComponent, {centered: true});
    this.modalService.setElementId(elementId);
  }

     // Modal - Provider Request doc
     viewPaymentRequest(elementId: string) {
      this.ngbModal.open(ViewPaymentRequestComponent, {centered: true});
      this.modalService.setElementId(elementId);
    }

}
