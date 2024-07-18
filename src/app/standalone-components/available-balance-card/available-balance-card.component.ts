import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/_services/settings.service';
@Component({
  selector: 'app-available-balance-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './available-balance-card.component.html',
  styleUrls: ['./available-balance-card.component.scss'],
  providers: [DecimalPipe]
})
export class AvailableBalanceCardComponent {

  @Input() providerId: string;
  @Input() currency: string;

  
  //providerId:string;
  allMoney: number;
  moneyToReceive: number;
  pendingMoney: number;
  transactionHistory: number;
  commission: number;
  myCurrency:string;
  receivedMoney:number;

  constructor(
    private userService:UserDataService,
    private translate: TranslateService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {

    // TO DO - de verificat ruta daca are id, daca are populam pagina cu informatii luate din getProviderById, daca nu - din getCurrentUser
    this.getProviderId();
    console.log("providerul din componenta:", this.providerId);
  }

  getProviderId(){
   
      if(this.providerId){
        this.getUserById(this.providerId);
        this.myCurrency=this.currency;
      }else{
        this.getCurrentUser();
        this.myCurrency=this.currency;
      }
  }

  

  getUserById(providerId){
    this.userService.getUserById(providerId).subscribe((userData:any)=>{
      console.log("Data by id din componenta",userData);

      this.allMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.allMoney : 0;
      this.receivedMoney= userData?.earnedMoney !== null ? userData?.earnedMoney?.receivedMoney : 0;
      this.moneyToReceive=userData?.earnedMoney !== null ? userData?.earnedMoney?.moneyToReceive:0;
      this.pendingMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.pendingMoney: 0;
      this.commission=userData?.earnedMoney !== null ? userData?.earnedMoney?.commission: 0;
      this.transactionHistory=userData?.earnedMoney !== null ? userData?.earnedMoney?.transactionHistory : 0;
    });
  }

  getCurrentUser(){
    this.userService.getCurrentUser().subscribe((userData:any)=>{

      console.log("Data din componenta",userData);
      this.allMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.allMoney : 0;
      this.receivedMoney= userData?.earnedMoney !== null ? userData?.earnedMoney?.receivedMoney : 0;
      this.moneyToReceive=userData?.earnedMoney !== null ? userData?.earnedMoney?.moneyToReceive : 0;
      this.pendingMoney=userData?.earnedMoney !== null ? userData?.earnedMoney?.pendingMoney : 0;
      this.commission=userData?.earnedMoney !== null ? userData?.earnedMoney?.commission : 0;
      this.transactionHistory=userData?.earnedMoney !== null ? userData?.earnedMoney?.transactionHistory: 0;
    });
  }
}
