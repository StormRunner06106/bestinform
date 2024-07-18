import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EventTicketService} from "../../_services/event-ticket.service";

@Component({
    selector: 'app-delete-event-ticket',
    templateUrl: './delete-event-ticket.component.html',
    styleUrls: ['./delete-event-ticket.component.scss']
})
export class DeleteEventTicketComponent implements OnInit {
    currentTicket: any;

    constructor(private ticketService: EventTicketService,
                public dialogRef: MatDialogRef<DeleteEventTicketComponent>,
                @Inject(MAT_DIALOG_DATA) public ticketData: { ticket: any, index: number }) {
    }

    ngOnInit() {

        this.currentTicket = this.ticketData.ticket;
    }

    close(): void {
        this.dialogRef.close();
    }


    deleteTicket() {
        //chef if you are on EDIT RESOURCE
        if (this.ticketService.eventId$.getValue()) {
            //check if you want to delete a room added now
            if(this.ticketData.ticket.state ==='add'){
                // Get Room List
                const ticketList = this.ticketService.ticketsList$.getValue()

                // Exclude the room by id
                const filteredTickets = ticketList.filter(ticket => ticket.id !== this.ticketData.ticket.id);

                // Check if a room was deleted and update the array
                if (filteredTickets.length !== ticketList.length) {
                    this.ticketService.ticketsList$.next(filteredTickets);
                    this.ticketService.refreshTicketList$.next(true);
                    this.close();
                } else {
                    console.log(`Room not found`);

                }
            }else{

                //just move the ticket in the delete array

                const ticketList = this.ticketService.ticketsList$.getValue()

                // Exclude the room by id
                const filteredTickets = ticketList.filter(ticket => ticket.id !== this.ticketData.ticket.id);

                // Check if a room was deleted and update the array
                if (filteredTickets.length !== ticketList.length) {
                    this.ticketService.ticketsList$.next(filteredTickets);
                    this.ticketService.addTicketToDeleteArray(this.ticketData.ticket);
                    this.ticketService.refreshTicketList$.next(true);
                    this.close();
                }
            }
        }
        else {
            //on CREATE RESOURCE
            // Get ticket List
            const ticketList = this.ticketService.ticketsList$.getValue()

            // Exclude the ticket by id
            const filteredTickets = ticketList.filter(ticket => ticket.id !== this.ticketData.ticket.id);

            // Check if a room was deleted and update the array
            if (filteredTickets.length !== ticketList.length) {
                this.ticketService.ticketsList$.next(filteredTickets);
            } else {
                console.log(`Room not found`);
            }
            console.log('DELETE');
            this.dialogRef.close();
        }
    }
}
