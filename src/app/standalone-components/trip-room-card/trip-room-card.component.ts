import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TripRoom} from "../../shared/_models/trip.model";
import {FormControl, Validators} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";

export type TripRoomEvent = {
    priceChange: number,
    room: TripRoom
}

@Component({
    selector: 'app-trip-room-card',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './trip-room-card.component.html',
    styleUrls: ['./trip-room-card.component.scss']
})
export class TripRoomCardComponent implements OnInit {
    @Input() tripRoom: TripRoom;
    @Input() nrOfNights: number;
    @Output() tripRoomNrChange = new EventEmitter<TripRoomEvent>();

    roomsNr: FormControl;

    ngOnInit(): void {
        this.roomsNr = new FormControl(0, [Validators.min(0), Validators.max(this.tripRoom.available)]);
    }

    increaseRoomsNr(): void {
        let currentNr = this.roomsNr.value;
        if (currentNr === this.tripRoom.available) return;
        this.roomsNr.setValue(++currentNr);
        this.tripRoomNrChange.emit({
            priceChange: this.tripRoom.price,
            room: this.tripRoom
        });
    }

    decreaseRoomsNr(): void {
        let currentNr = this.roomsNr.value;
        if (currentNr === 0) return;
        this.roomsNr.setValue(--currentNr);
        this.tripRoomNrChange.emit({
            priceChange: this.tripRoom.price * -1,
            room: this.tripRoom
        });
    }

}
