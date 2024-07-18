import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'youtubeEmbed',
    standalone: true
})
export class YoutubeEmbedPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(videoId: string): SafeResourceUrl {
        const url = `https://www.youtube.com/embed/${videoId}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
