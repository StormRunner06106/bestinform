import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RentalBookingService {


    refreshRoomList$ = new BehaviorSubject(false)
    roomList$ = new BehaviorSubject([])

    deleteArray$ = new BehaviorSubject([]);

    imagesArray$ = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
    }


    /** Listeners */
    refreshRoomListData() {
        return this.refreshRoomList$.asObservable()
    }

    roomListData() {
        return this.roomList$.asObservable()
    }

    /** TO DO: de sters*/
    deleteArrayData(){
        return this.deleteArray$.asObservable();
    }

    imagesArrayData(){
        return this.imagesArray$.asObservable();
    }


    /** Custom Functions */
    addRoomToList(room) {
        this.roomList$.next(this.roomList$.getValue().concat(room))
    }

    addRoomToDeleteArray(room){
        this.deleteArray$.next(this.deleteArray$.getValue().concat(room));
    }

    addImgToImagesArray(img){
        this.imagesArray$.next(this.imagesArray$.getValue().concat(img));
    }

    /** API Requests  */
    createRoom(id: string, data: object) {
        return this.http.post('/bestinform/createRoom?resourceId=' + id, data)
    }

    createRooms(id: string, data: object[]) {
        return this.http.post('/bestinform/createRooms?resourceId=' + id, data)
    }

    updateRoom(id: string, data: object) {
        return this.http.put('/bestinform/updateRoom?roomItemId=' + id, data)
    }

    deleteRoom(roomId: string) {
        return this.http.delete('/bestinform/deleteRoom?roomItemId=' + roomId)
    }

    getRoomList(resourceId: string) {
        return this.http.get('/bestinform/getRoomListByResourceId?resourceId=' + resourceId)
    }

    uploadRoomThumbnail(roomId: string, image) {
        return this.http.post('/bestinform/uploadRoomImage?roomId=' + roomId, image)
    }

    uploadRoomGallery(roomId: string, images) {
        return this.http.post('/bestinform/uploadRoomItemImages?roomItemId=' + roomId, images)
    }

}
