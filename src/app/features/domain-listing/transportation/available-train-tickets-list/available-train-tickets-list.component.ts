import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TicketService } from 'src/app/shared/_services/tickets.service';

export interface ITrainTicket {
    transportNumber?: string;
    transportDuration?: number;
    departureDate?: string;
    arrivalDate?: string;
    price?: number;
    from?: string;
    stops?: number;
    to?: string;
    companyName?: string;
    travelClass?: string;
    currency?: string;
    iconPath?: string;
}

@Component({
  selector: 'app-available-train-tickets-list',
  templateUrl: './available-train-tickets-list.component.html',
  styleUrls: ['./available-train-tickets-list.component.scss']
})
export class AvailableTrainTicketsListComponent {


  ticketList:Array<ITrainTicket>=[];
  trainTicketForm:any;

  private ngUnsubscribe = new Subject<void>();


  constructor(private ticketsService:TicketService){
  }

  ngOnInit():void{
    this.getTicketsList();
    this.getTrainTicketForm();        
  }

  getTicketsList(){
    this.ticketsService.getTrainTickets()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any) => {
        this.ticketList=res;
        console.log('lista din lista: ', this.ticketList);
      } 
    })
  }

  //get form Data
  getTrainTicketForm(){
    //to do:in functie de ce trimitem din formular, trebuie sa cautam ticketele disponibile. 
    this.trainTicketForm=this.ticketsService.getTrainFormValues();
    
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
