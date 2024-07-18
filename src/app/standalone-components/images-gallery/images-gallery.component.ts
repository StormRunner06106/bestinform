import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-images-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images-gallery.component.html',
  styleUrls: ['./images-gallery.component.scss']
})
export class ImagesGalleryComponent {
  @Input() images: Array<{
    fileName?: string;
    filePath?: string;
  }>;

}
