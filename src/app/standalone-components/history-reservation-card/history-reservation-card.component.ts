import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/_services/settings.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';


@Component({
  selector: 'app-history-reservation-card',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule,TranslateModule],
  templateUrl: './history-reservation-card.component.html',
  styleUrls: ['./history-reservation-card.component.scss'],
  providers: [ DecimalPipe]
})
export class HistoryReservationCardComponent {
  @ViewChild("chart") chart: ChartComponent;

  @Input() currency: string;
  @Input() providerId: string;


 // chart
 chartOptions:any;
  allMoney:number;
//  constructor(
//   // private route: ActivatedRoute,
//   // private userService:UserDataService,
//   // private resourcesService:ResourcesService,
//   // private cdr:ChangeDetectorRef,
//   // private ngbModal:NgbModal,
//   // private modalService:ModalService,
//   // private providersService:ProvidersService,
//   // private datePipe: DatePipe
//   //serviciul de adaugare cereri
// ) {}

constructor(  private settingsServices:SettingsService,
  private userService:UserDataService
  ){
}

ngOnInit(): void {
  this.chartOptions=this.getChartOptions();
  this.getProviderId();
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


  getProviderId(){
   
    if(this.providerId){
      this.getUserById(this.providerId);
      
    }else{
      this.getCurrentUser();
      
    }
}



getUserById(providerId){
  this.userService.getUserById(providerId).subscribe((userData:any)=>{
    console.log("Data din history",userData);

    this.allMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.allMoney : 0;
    // this.moneyToReceive=userData?.earnedMoney !== null ? userData?.earnedMoney?.moneyToReceive:0;
    // this.pendingMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.pendingMoney: 0;
    // this.commission=userData?.earnedMoney !== null ? userData?.earnedMoney?.commission: 0;
    // this.transactionHistory=userData?.earnedMoney !== null ? userData?.earnedMoney?.transactionHistory : 0;
  });
}

getCurrentUser(){
  this.userService.getCurrentUser().subscribe((userData:any)=>{

    console.log("Data din history",userData);
    this.allMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.allMoney : 0;
    // this.moneyToReceive=userData?.earnedMoney !== null ? userData?.earnedMoney?.moneyToReceive : 0;
    // this.pendingMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.pendingMoney : 0;
    // this.commission=userData?.earnedMoney !== null ? userData?.earnedMoney?.commission : 0;
    // this.transactionHistory=userData?.earnedMoney !== null ? userData?.earnedMoney?.transactionHistory: 0;
  });
}
}
