import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RentalBookingService} from "../../../../../../_services/rental-booking.service";
import {ResourcesService} from "../../../../../../_services/resources.service";

@Component({
    selector: 'app-delete-room-modal',
    templateUrl: './delete-room-modal.component.html',
    styleUrls: ['./delete-room-modal.component.scss']
})


export class DeleteRoomModalComponent {

    constructor(public dialogRef: MatDialogRef<DeleteRoomModalComponent>,
                @Inject(MAT_DIALOG_DATA) public room: { roomData },
                private roomService: RentalBookingService,
                private resourceService: ResourcesService,) {

    }


    /** Delete Room */
    deleteRoom() {
        // Check if you are on EDIT
        if (this.resourceService.resourceId$.getValue()){
            //check if you want to delete a room added now
            if(this.room.roomData.state ==='add'){
                // Get Room List
                const roomList = this.roomService.roomList$.getValue()

                // Exclude the room by id
                const filteredRooms = roomList.filter(room => room.id !== this.room.roomData.id);

                // Check if a room was deleted and update the array
                if (filteredRooms.length !== roomList.length) {
                    this.roomService.roomList$.next(filteredRooms);
                    this.roomService.refreshRoomList$.next(true);
                    this.close();
                } else {
                    console.log(`Room not found`);

                }
            }else{

                //just move the room in the delete array

                const roomList = this.roomService.roomList$.getValue()

                // Exclude the room by id
                const filteredRooms = roomList.filter(room => room.id !== this.room.roomData.id);

                // Check if a room was deleted and update the array
                if (filteredRooms.length !== roomList.length) {
                    this.roomService.roomList$.next(filteredRooms);
                    this.roomService.addRoomToDeleteArray(this.room.roomData);
                    console.log('DELETE ARRAY', this.roomService.deleteArray$.getValue());
                    this.roomService.refreshRoomList$.next(true);
                    this.close();
                }
            }
        }

        else {
            //delete room in add resource state
            // Get Room List
            const roomList = this.roomService.roomList$.getValue()

            // Exclude the room by id
            const filteredRooms = roomList.filter(room => room.id !== this.room.roomData.id);

            // Check if a room was deleted and update the array
            if (filteredRooms.length !== roomList.length) {
                this.roomService.roomList$.next(filteredRooms);
            } else {
                console.log(`Room not found`);
            }

            // Close Modal
            this.close()
        }
    }

    //----------------Modal-------------//
    /** Close Dialog */
    close(): void {
        this.dialogRef.close();
    }
}
