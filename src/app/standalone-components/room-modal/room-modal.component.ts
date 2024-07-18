import {Component, Inject, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Room} from "../../shared/_models/room.model";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
    selector: 'app-room-modal',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    templateUrl: './room-modal.component.html',
    styleUrls: ['./room-modal.component.scss']
})
export class RoomModalComponent implements OnInit {

    room: Room = null;
    nights: number = null;

    gallery: Array<{
        fileName?: string;
        filePath?: string;
    }> = null;
    galleryIndex = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: {room: Room, nights: number}) {
    }

    ngOnInit(): void {
        this.room = {...this.data.room};
        this.nights = this.data.nights;
        this.initGallery();
    }

    initGallery(): void {
        this.gallery = [];

        if (!this.room?.featuredImage) return;
        this.gallery.push(this.room.featuredImage);

        if (!this.room?.images || this.room?.images?.length === 0) return;
        this.room.images.forEach( image => {
            this.gallery.push(image);
        });
    }

    cycleGallery(direction: number): void {
        if (direction > 0) {
            this.galleryIndex++;
            if (this.galleryIndex > this.gallery.length - 1) this.galleryIndex = 0;

        } else {
            this.galleryIndex--;
            if (this.galleryIndex < 0) this.galleryIndex = this.gallery.length - 1;
        }
    }

}
