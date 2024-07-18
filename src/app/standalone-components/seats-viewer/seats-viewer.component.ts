import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CulturalRoom, Seat} from "../../shared/_models/cultural-room.model";
import {MatLegacyTooltipModule} from "@angular/material/legacy-tooltip";
import {
    SelectedSeat
} from "../../features/domain-listing/view-simple-resource/booking-type-tab-items/booking-type-items.service";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatLegacyMenuModule} from "@angular/material/legacy-menu";
import {MatLegacyRadioModule} from "@angular/material/legacy-radio";
import {MatRadioChange} from "@angular/material/radio";

@Component({
    selector: 'app-seats-viewer',
    standalone: true,
    imports: [CommonModule, MatLegacyTooltipModule, ReactiveFormsModule, MatLegacyMenuModule, MatLegacyRadioModule, FormsModule],
    templateUrl: './seats-viewer.component.html',
    styleUrls: ['./seats-viewer.component.scss']
})
export class SeatsViewerComponent implements OnChanges, OnInit {
    @Input() culturalRoom: CulturalRoom;
    @Input() rowsGenerationType: 'numbers' | 'letters';
    @Output() seatSelection = new EventEmitter<SelectedSeat[]>();

    isEditMode = true;
    hasBookedWithReservation = false;

    private selectedSeatsMatrix: SelectedSeat[][] = null;

    // width by nr of columns
    maxZoneWidth = 0;

    ngOnInit(): void {
        this.checkIfEditMode();

        if (!this.isEditMode) {
            this.createEmptySeatsMatrix();
        } else {
            this.hasBookedWithReservation = this.checkIfBookedWithReservation();
        }
    }

    ngOnChanges(): void {
        console.log('se apeleaza on changes');
        if (!this.isEditMode) return;

        this.createMaxZoneWidth();
    }

    checkIfEditMode() {
        if (this.seatSelection.observed) {
            this.isEditMode = false;
        }
    }

    checkIfBookedWithReservation(): boolean {
        for (const zone of this.culturalRoom.zones) {
            for (const row of zone.rowsForBooking) {
                for (const seat of row.seats) {
                    if (seat.seatStatus === 'bookedWithReservation') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    createEmptySeatsMatrix() {
        this.selectedSeatsMatrix = [];

        for (const zone of this.culturalRoom.zones) {
            this.checkIfMaxWidth(zone.columns);

            for (let rowIndex = 0; rowIndex < zone.rows; rowIndex++) {
                const row = [];
                for (let columnIndex = 0; columnIndex < zone.columns; columnIndex++) {
                    row.push(null);
                }
                this.selectedSeatsMatrix.push(row);
            }
        }
        console.log('empty seats matrix', this.selectedSeatsMatrix);
    }

    createMaxZoneWidth() {
        this.maxZoneWidth = 0;
        for (const zone of this.culturalRoom.zones) {
            this.checkIfMaxWidth(zone.columns);
        }
    }

    toggleSeat(zoneIndex: number, rowIndex: number, seatIndex: number) {
        console.log('seat toggle', zoneIndex, rowIndex, seatIndex);

        const selectedZone = this.culturalRoom?.zones[zoneIndex];
        const selectedRow = selectedZone?.rowsForBooking[rowIndex];
        const selectedSeat = selectedRow?.seats[seatIndex];

        if (selectedSeat.seatStatus === 'booked' || selectedSeat.seatStatus === 'empty') return;

        // because each row index resets to 0 for each zone, we calculate the absolute row index to use in the matrix
        let rowOffset = 0;
        if (zoneIndex >= 1) {
            for (let index = 0; index < zoneIndex; index++) {
                rowOffset += this.culturalRoom.zones[index].rows;
            }
        }

        if (selectedSeat?.seatStatus === 'available') {
            selectedSeat.seatStatus = 'selected';
            this.selectedSeatsMatrix[rowIndex + rowOffset][seatIndex] = {
                price: selectedZone.price,
                rowLabel: selectedRow.rowLabel,
                seatColumnLabel: selectedSeat.seatColumnLabel
            }
        } else if (selectedSeat?.seatStatus === 'selected') {
            selectedSeat.seatStatus = 'available';
            this.selectedSeatsMatrix[rowIndex + rowOffset][seatIndex] = null;
        }

        console.log(this.selectedSeatsMatrix);

        // transformam matricea intr-un singur array si scoatem valorile null, apoi emitem arrayul de locuri
        console.log(this.selectedSeatsMatrix.flat().filter(seat => seat));
        this.seatSelection.emit(this.selectedSeatsMatrix.flat().filter(seat => seat));
    }

    checkIfMaxWidth(columns: number) {
        this.maxZoneWidth = this.maxZoneWidth < columns ? columns : this.maxZoneWidth;
    }

    onChangeSeatStatus(event: MatRadioChange, zoneIndex: number, rowIndex: number, seatIndex: number) {
        console.log(event, zoneIndex, rowIndex, seatIndex);
        const currentRow = this.culturalRoom.zones[zoneIndex].rowsForBooking[rowIndex].seats;

        this.regenerateSeatLabels(currentRow);

        if (this.isRowEmpty(currentRow)) {
            this.culturalRoom.zones[zoneIndex].rowsForBooking[rowIndex].rowLabel = null;
            this.regenerateRowLabels();
        } else {
            this.regenerateRowLabels();
        }

    }

    regenerateSeatLabels(seats: Seat[]) {
        let seatLabelCounter = 1;
        for (const seat of seats) {
            if (seat.seatStatus !== 'empty') {
                seat.seatColumnLabel = seatLabelCounter;
                seatLabelCounter++;
            } else {
                seat.seatColumnLabel = null;
            }
        }
    }

    regenerateRowLabels() {
        let rowLabelAsNumber = 1;

        for (const zone of this.culturalRoom.zones) {
            for (const row of zone.rowsForBooking) {
                if (!this.isRowEmpty(row.seats)) {
                    row.rowLabel = this.rowsGenerationType === 'numbers' ? rowLabelAsNumber.toString() : this.numberToLetters(rowLabelAsNumber);
                    rowLabelAsNumber++;
                }
            }
        }
    }

    numberToLetters(number: number): string {
        let str = '', q, r;
        while (number > 0) {
            q = (number - 1) / 26;
            r = (number - 1) % 26;
            number = Math.floor(q);
            str = String.fromCharCode(65 + r) + str;
        }
        return str;
    }

    isRowEmpty(seats: Seat[]) {
        let rowIsEmpty = true;
        seats.forEach( seat => {
            if (seat.seatStatus !== 'empty') {
                rowIsEmpty = false;
            }
        });
        return rowIsEmpty;
    }
}
