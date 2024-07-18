import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { ResourcesService } from 'src/app/shared/_services/resources.service';
import {ChartComponent} from "ng-apexcharts";
import {OwlOptions} from "ngx-owl-carousel-o";
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { Subject, takeUntil } from 'rxjs';
import { ChangeStatusProviderComponent } from '../change-status-provider/change-status-provider.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { Router } from '@angular/router';
import { Settings } from '@vime/angular';
import { SettingsService } from 'src/app/shared/_services/settings.service';
import { DecimalPipe } from '@angular/common';
import { DomainsService } from 'src/app/shared/_services/domains.service';

@Component({
  selector: 'app-view-provider',
  templateUrl: './view-provider.component.html',
  styleUrls: ['./view-provider.component.scss'],
  providers: [DecimalPipe]
})



export class ViewProviderComponent implements OnInit {

  @ViewChild("chart") chart: ChartComponent;
  // public chartOptions: Partial<ChartOptions>;

  private ngUnsubscribe = new Subject<void>();



  providerId:string;
  companyName:string;
  county:string;
  city:string;
  coverImagePath:string;
  domain:string;
  currency:string;
  status:string;

  //balance date of provider
  allMoney:number; //balanta disponibila
  moneyToReceive:number;
  pendingMoney:number;
  commission:number; //comision
  transactionHistory:number;

  //resources Type data
  resourceTypeId:string;
  resourceTypeIconPath:string;

  //resources list
  resourcesList:Array<any> = [];
  finalResourcesList:Array<any> = [];
  recentTransactionList:Array<any>=[];

  //filter Resources
  page: number;
  size: number;
  sort: string;
  dir: string;

  //carousel

  isStaff:boolean;
  isProvider:boolean;
  isAdmin:boolean;

  allDomains: Array<any>;

  userDomain: string;

  //chart
  chartOptions:any;

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<', '>'],
    autoWidth: true,
    margin: 20,
    responsive: {
      0: {
        items: 1,
        margin:0
      },
      400: {
        items: 2
      },
      740: {
        items: 2
      },
      900:{
        items: 3
      },
      1200: {
        items: 4
      }
    },
    nav: true
  }



  constructor(
    private route: ActivatedRoute,
    private userService:UserDataService,
    private resourcesService:ResourcesService,
    private providersService: ProvidersService,
    private ngbModal:NgbModal,
    private modalService:ModalService,
    private settingsService:SettingsService,
    private domainService:DomainsService
  ) {
  }

  ngOnInit(): void {
    this.getPathSlug();
    this.getDomains();
    this.page=0;
    this.size=-1;
    this.sort='';
    this.dir='';

    this.chartOptions=this.getChartOptions();

  }


  getDomains() {
    this.resourcesService.getListOfDomains().subscribe((resp: any) => {
      console.log('Domenii', resp);
      this.allDomains = resp;
    })
  }

  //get the provider slug from url
  getPathSlug() {
    
    this.route.params.subscribe(params => {
      if(params['id']){
        this.providerId = params['id'];
        this.getUserById(this.providerId);
        this.getSettings();
        // this.getReservation(this.providerId);
        this.isStaff=true;

      }else{
        this.getCurrentUser();
        this.getSettings();
        this.isProvider=true;

        // this.getReservation(this.providerId);

      }


    });
}

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

  //get data for chart
  getChartData(){
    const filter={
      providerId: this.providerId,
      // date:
    }

    // this.providersService.listReservationFiltered(0,3,'date', 'desc', filter)
    // .subscribe((list:any)=>{
    //   console.log("lista de rezervari",list.content);
    //   this.recentTransactionList=list.content;
    // });

  }

  getSettings(){
    this.settingsService.getCurrentSettings()
    .subscribe((data:any)=>{
      if(data!==null){
        this.currency= data?.currency !== null ? data?.currency : 'EUR';
      }else{
      this.currency='EUR';
      }    });
  }

  //get current user
  getCurrentUser(){
    this.userService.getCurrentUser().subscribe((userData:any)=>{
      console.log('USER DATA: ' ,userData);
          // this.providerId=userData?.id;
          this.companyName=userData?.companyName;
          this.county=userData?.billingAddress?.county;
          this.city=userData?.billingAddress?.city;
          this.domain=userData?.domain;
          this.status= userData?.approvedStatus;
          this.coverImagePath=userData?.coverImage !==null? userData?.coverImage?.filePath: "../../../assets/images/others/coming-soon-min.jpg";

          // balance data
          this.allMoney=userData?.earnedMoney?.allMoney;
          this.moneyToReceive=userData?.earnedMoney?.moneyToReceive;
          this.pendingMoney=userData?.earnedMoney?.pendingMoney;
          this.commission=userData?.earnedMoney?.commission;
          this.transactionHistory=userData?.earnedMoney?.transactionHistory;

          // this.userDomain = this.allDomains?.find((x: any) => x.id === userData?.domain)?.nameEn;
          this.domainService.getDomainById(userData.domain).subscribe((domain:any)=>{
            this.userDomain=domain.nameEn;
          })
          console.log('USER DOMAIN', this.userDomain);
          this.getResourcesList(userData?.id);
          // if(this.providerId !== undefined || this.providerId!==null){
            this.getReservation(userData.id);
          // }
          
    })
  }


  getUserById(providerId){
    // this.getReservation(providerId);

    this.userService.getUserById(providerId)
    .subscribe(
        (userData:any)=>{
        this.providerId=userData?.id;
        this.companyName=userData?.companyName;
        this.county=userData?.billingAddress.county;
        this.city=userData?.billingAddress.city;
        this.domain=userData?.domain;
          this.coverImagePath=userData?.coverImage !==null? userData?.coverImage?.filePath: "../../../assets/images/others/coming-soon-min.jpg";
          this.status= userData?.approvedStatus;

        // balance data
        this.allMoney=userData?.earnedMoney?.allMoney;
        this.moneyToReceive=userData?.earnedMoney?.moneyToReceive;
        this.pendingMoney=userData?.earnedMoney?.pendingMoney;
        this.commission=userData?.earnedMoney?.commission;
        this.transactionHistory=userData?.earnedMoney?.transactionHistory;

        this.domainService.getDomainById(userData?.domain).subscribe((domain:any)=>{
          this.userDomain=domain.nameEn;
          console.log('NUME DOMENIU', this.userDomain);
        })
          // this.userDomain = this.allDomains?.find((x: any) => x.id === userData?.domain).nameEn;
          // console.log('USER DOMAIN by id',this.userDomain);
          this.getResourcesList(userData?.id);
          this.getReservation(userData.id);
          // if(this.providerId !== undefined || this.providerId!==null){

          // this.getReservation();
        // }


        }
      )
  }

  getResourcesList( userId: string){

    const filterObj={
      userId:userId
    }

    this.resourcesService.listResourceFiltered(this.page,this.size,this.sort,this.dir,filterObj)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(data:any)=>{

        this.resourcesList=data?.content;
        this.resourcesList.forEach((element:any, index:number) => {
            this.resourcesService.getResourceTypeById(element.resourceTypeId).subscribe((data:any)=>{
              this.finalResourcesList.push({
                index:index,
                resourceId:element?.id,
                title: element?.title,
                address: element?.address,
                icon:data?.icon,
                price:element?.totalBookingAmount,
              });
            });
        });
        console.log('cautam rezervarile', this.finalResourcesList);

     }
    })
  }

  //recent transaction
  getReservation(idProvider){

      const filter={
        providerId: idProvider
      }
  
      console.log('filter id?', filter);
  
      this.providersService.listReservationFiltered(0,3,'date', 'desc', filter)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (list:any)=>{
        console.log("lista de rezervari 1",list.content);
        this.recentTransactionList=list?.content;
        console.log('lista de tranzactii', this.recentTransactionList);

      }
      
    });
    
    

  }

  //change status
  changeStatusModal(elementId: string){
    this.ngbModal.open(ChangeStatusProviderComponent, {centered: true});
    this.modalService.setElementId(elementId);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
