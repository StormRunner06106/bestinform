import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {HotelMarkup} from "../hotels.component";
import {HotelsService} from "../../../../shared/_services/hotels.service";
import {Toast} from "primeng/toast";
import {ToastService} from "../../../../shared/_services/toast.service";

export interface HotelMarkupDialogData {
    hotelMarkup: HotelMarkup;
    add: boolean;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: "app-hotel-markup-dialog",
    templateUrl: "./hotel-markup-dialog.component.html"
})
export class HotelMarkupDialogComponent implements OnInit {

    showMarkup = false;

    constructor(public dialogRef: MatDialogRef<HotelMarkupDialogComponent>,
                public hotelsService: HotelsService,
                public toastService: ToastService,
                @Inject(MAT_DIALOG_DATA) public data: HotelMarkupDialogData) {

    }

    ngOnInit(): void {
        if (!this.data.add) {
            this.showMarkup = true;
        }
    }

    close() {
        this.dialogRef.close();
    }

    async verificaHotel() {
        const hotelValid = await this.hotelsService.findHotelWithMarkup(this.data.hotelMarkup.id);
        if (!hotelValid) {
            this.showMarkup = false;
            this.toastService.showToast("Atentionare", "Hotelul nu exista salvat in baza de date.", "warning");
        } else {
            this.data.hotelMarkup.bestinform_markup = hotelValid.bestinform_markup;
            this.data.hotelMarkup.name = hotelValid.name;
            this.showMarkup = true;
        }
    }


    async applyMarkup() {
        try {
            await this.hotelsService.applyHotelMarkup(this.data.hotelMarkup);
            this.toastService.showToast("Succes", "Adaosul a fost aplicat cu succes", "success");
            this.dialogRef.close(true);
        } catch (e) {
            this.toastService.showToast("Eroare", "Adaosul nu a putut fi aplicat", "error");
        }
    }
}
