import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-product-preview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-preview.component.html',
    styleUrls: ['./product-preview.component.scss']
})
export class ProductPreviewComponent implements OnInit {
    @Input() productData: any;
    @Input() list: boolean;

    filePath: string;
    defaultPath= 'https://s3-alpha-sig.figma.com/img/fc00/a652/fab9f5b40a9abaf5adeb9165f64e62e5?Expires=1682899200&Signature=eaGhDHW485Fgt9XFy6rzKUvILB-oqQ18Q1qcazv8cEcuwPmjqAs0cygdYtWsjAE-ycXQqRR2pmXH~VB9HmLz6VDoxXHAlXSQtOjwfsb0DlxLP~9l0bggTwh2unAZXXcZ~S21ta~--8t3AlATWi~ZNpRmwjvFQ4LZhhhx0ueMlOD0PEfFTL3~r4VzL2KOJPaoX7lfIO8F~yeIAIrA1aE-4TU4DpTHP0e4pf8HSWRmvzFJ5sJUsVOh7qM1GBEUYvQHq7Qdj7rEimXKHaWHKcCA2skJfyCy~3JNOu6YMxk3zNglxL0GYsScn7Ialv1452lV2Y1KSfNl7AhCnF-Qw1vfAw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

    ngOnInit() {
        console.log(this.productData.images);
        if (this.productData.images?.length > 0) {
            this.filePath = this.productData.images[0].filePath;
            console.log('imgs',this.productData.images);
        } else {
            this.filePath = null;
        }
    }
}
