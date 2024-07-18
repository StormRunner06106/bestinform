import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Room} from "../../shared/_models/room.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {RoomModalComponent} from "../room-modal/room-modal.component";
import {ToastService} from "../../shared/_services/toast.service";

export type RoomEvent = {
    number: number,
    room: Room
}

@Component({
    selector: 'app-room-card',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './room-card.component.html',
    styleUrls: ['./room-card.component.scss']
})
export class RoomCardComponent implements OnInit {
    @Input() room: Room;
    @Input() recommendation: boolean;
    @Input() totalNights: number;
    @Input() reservationQty: number;
    @Input() modifiable: boolean;
    @Output() roomNrChange = new EventEmitter<RoomEvent>();

    filterForm: FormGroup;

    constructor(private fb: FormBuilder,
                private dialog: MatDialog,
                private toastService: ToastService,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.filterForm = this.fb.group({
            roomsNumber: [this.reservationQty <= this.room?.itemsForBooking.length ? this.reservationQty : 0, [Validators.min(0), Validators.max(this.room?.itemsForBooking.length)]]
        });
    }

    decreaseNrRooms(formControlName: string): void {
        if (this.modifiable === false) {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                `You can't modify this room`,
                "error");
            return;
        }
        let currentValue = this.filterForm.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.filterForm.get(formControlName).patchValue(--currentValue);
        this.roomNrChange.emit({
            number: this.room.totalPrice * -1,
            room: this.room
        });
    }

    increaseNrRooms(formControlName: string): void {
        if (this.modifiable === false) {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                `You can't modify this room`,
                "error");
            return;
        }
        let currentValue = this.filterForm.get(formControlName).value;
        if (currentValue === this.room?.itemsForBooking.length) {
            return;
        }
        this.filterForm.get(formControlName).patchValue(++currentValue);
        this.roomNrChange.emit({
            number: this.room.totalPrice,
            room: this.room
        });
    }

    openRoomModal() {
        this.dialog.open(RoomModalComponent, {
            width: "100%",
            maxWidth: 1200,
            maxHeight: "80vh",
            height: "auto",
            data: {room: this.room, nights: this.totalNights}
        });
    }
}
