import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class LowercaseUrlSerializer extends DefaultUrlSerializer {
    parse(url: string): UrlTree {
        // Convert the URL to lowercase before parsing
        return super.parse(url.toLowerCase());
    }
}
