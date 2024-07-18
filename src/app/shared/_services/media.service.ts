import { HttpClient} from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class MediaService{

    constructor(
        public http:HttpClient,
    ){}

    //list of photos
    listMediaFiltered(page:number, size:number, sort?:string, dir?:string, filters?: object) {
        return this.http.post('/bestinform/listMediaFiltered?page='+ page +'&size='+ size +'&sort='+ sort +'&dir='+dir, filters);
    }

    //update media
    updateMedia(mediaId: string, mediaData: object) {
        return this.http.put('/bestinform/updateMedia?mediaId=' + mediaId, mediaData);
    }

    //change media status
    changeMediaStatus(status: string, mediaId: string) {
        return this.http.put('/bestinform/changeMediaStatus?status=' + status+ '&mediaId='+mediaId,{});
    }

    //upload media
    uploadMedia(mediaId: string, file: any) {
        return this.http.post('/bestinform/uploadMedia?mediaId=' + mediaId, file);
    }

    //add media
    addMedia() {
        return this.http.post('/bestinform/addMedia', {});
    }

    //get media by id
    getMediaById(mediaId: string) {
        return this.http.get('/bestinform/getMediaById?mediaId=' + mediaId);
    }

    //delete media by id
    deleteMediaById (mediaId: string) {
        return this.http.delete('/bestinform/deleteMediaById?mediaId=' + mediaId, {});
    }

}