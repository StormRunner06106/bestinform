import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TicketsBookingService} from "../../../../../../_services/tickets-booking.service";
import {ResourcesService} from "../../../../../../_services/resources.service";

@Component({
    selector: 'app-delete-ticket',
    templateUrl: './delete-ticket.component.html',
    styleUrls: ['./delete-ticket.component.scss']
})
export class DeleteTicketComponent implements OnInit {

    currentTicket: any;

    constructor(private ticketService: TicketsBookingService,
                private resourceService: ResourcesService,
                public dialogRef: MatDialogRef<DeleteTicketComponent>,
                @Inject(MAT_DIALOG_DATA) public ticketData: { ticket: any, index: number }) {
    }

    ngOnInit() {
        this.currentTicket = this.ticketData.ticket;
    }

    close(): void {
        this.dialogRef.close();
    }


        //de tratat cazul in care face update la ceva existent si apoi sterge
    deleteTicket() {
        //chef if you are on EDIT RESOURCE
        if (this.resourceService.resourceId$.getValue()) {
            //we get the initial ticket list from backend (this might be shorter if an item was deleted or updated)
            const initList = this.ticketService.ticketsList$.getValue();
            //find this ticket in the initial list by id
            const filteredOriginalTickets = initList.filter(ticket => ticket.id !== this.ticketData.ticket.id);

            //we get the createArray to be able to look for the ticket if it was added recently
            const createList = this.ticketService.createArray$.getValue();
            // find this ticket in the current create list
            const filteredCreateTickets = createList.filter(ticket => ticket.id !== this.ticketData.ticket.id);

            //we get the updateArray to be able to look for the ticket if it was updated recently
            const updateArray = this.ticketService.updateArray$.getValue();
            // find this ticket in the current update list
            const filteredUpdateTickets = updateArray.filter(ticket => ticket.id !== this.ticketData.ticket.id);


            if (filteredOriginalTickets.length !== initList.length) {
                /**to do ---- de trimis doar id ul*/

                //if you want to detele a ticket from the initial array, it will be moved to the delete array

                this.ticketService.addTicketToDeleteArray(this.ticketData.ticket);
                console.log('delete first array', this.ticketService.deleteArray$.getValue());

                this.ticketService.ticketsList$.next(filteredOriginalTickets);
                this.ticketService.refreshTicketList$.next(true);

            }else if(filteredCreateTickets.length !== createList.length){
                //if you want to delete a ticket that was created now, you delete it from the create array
                this.ticketService.createArray$.next(filteredCreateTickets);
                console.log('sterg un bilet creat', filteredCreateTickets);

                this.ticketService.refreshCreateArray$.next(true);

            }else if(filteredUpdateTickets.length !== updateArray.length){
                console.log('vrei sa stergi un ticket care a fost editat');
                //if you want to delete a ticket that was updated this session, it will be moved to the delete array
                this.ticketService.addTicketToDeleteArray(this.ticketData.ticket);
                this.ticketService.updateArray$.next(filteredUpdateTickets);
                console.log('array-ul de delete', this.ticketService.deleteArray$.getValue());
                console.log('array-ul de update', this.ticketService.updateArray$.getValue());
                this.ticketService.refreshUpdateArray$.next(true);
            }
            else {
                console.log(`nu a fost gasit`);
            }

            this.dialogRef.close();


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
