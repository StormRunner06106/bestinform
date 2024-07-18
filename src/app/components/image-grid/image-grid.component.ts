import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: "app-image-grid",
  templateUrl: "./image-grid.component.html",
  styleUrls: ["./image-grid.component.scss"],
})
export class ImageGridComponent implements OnInit {
  @Input() images: any[] = [];
  @Input() selected: string;
  @Input() carouselImages: any = [];
  @Input() isBiggerThan981: boolean = false;

  public display: boolean = false;
  public currentImageIndex: number = 0;
  public totalImages: number = 0;
  public shownImages: any[] = [];
  public shownGrid;

  responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 5,
    },
    {
      breakpoint: "768px",
      numVisible: 3,
    },
    {
      breakpoint: "560px",
      numVisible: 1,
    },
  ];

  gridStyle = [
    [
      {
        gridArea: "1 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 7 / 4",
      },
      {
        gridArea: "1 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 4 / 4",
      },
      {
        gridArea: "1 / 4 / 4 / 7",
      },
      {
        gridArea: "4 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 4 / 4",
      },
      {
        gridArea: "1 / 4 / 4 / 7",
      },
      {
        gridArea: "4 / 1 / 7 / 4",
      },
      {
        gridArea: "4 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 4",
      },
      {
        gridArea: "3 / 4 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 4",
      },
      {
        gridArea: "5 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 3",
      },
      {
        gridArea: "1 / 3 / 3 / 5",
      },
      {
        gridArea: "1 / 5 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 4",
      },
      {
        gridArea: "3 / 4 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 3",
      },
      {
        gridArea: "5 / 3 / 7 / 5",
      },
      {
        gridArea: "5 / 5 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 2",
      },
      {
        gridArea: "1 / 2 / 3 / 6",
      },
      {
        gridArea: "1 / 6 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 2",
      },
      {
        gridArea: "5 / 2 / 7 / 6",
      },
      {
        gridArea: "5 / 6 / 7 / 7",
      },
    ],
  ];
  gridStyleHotels = [
    [
      {
        gridArea: "1 / 1 / 5 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 7 / 4",
      },
      {
        gridArea: "1 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 4 / 4",
      },
      {
        gridArea: "1 / 4 / 4 / 7",
      },
      {
        gridArea: "4 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 4 / 4",
      },
      {
        gridArea: "1 / 4 / 4 / 7",
      },
      {
        gridArea: "4 / 1 / 7 / 4",
      },
      {
        gridArea: "4 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 4",
      },
      {
        gridArea: "3 / 4 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 4",
      },
      {
        gridArea: "1 / 4 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 4",
      },
      {
        gridArea: "5 / 4 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 3",
      },
      {
        gridArea: "1 / 3 / 3 / 5",
      },
      {
        gridArea: "1 / 5 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 4",
      },
      {
        gridArea: "3 / 4 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 3",
      },
      {
        gridArea: "5 / 3 / 7 / 5",
      },
      {
        gridArea: "5 / 5 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 2",
      },
      {
        gridArea: "1 / 2 / 3 / 6",
      },
      {
        gridArea: "1 / 6 / 3 / 7",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "5 / 1 / 7 / 2",
      },
      {
        gridArea: "5 / 2 / 7 / 6",
      },
      {
        gridArea: "5 / 6 / 7 / 7",
      },
    ],
    [
      {
        gridArea: "1 / 1 / 3 / 5",
      },
      {
        gridArea: "1 / 5 / 3 / 9",
      },
      {
        gridArea: "3 / 1 / 5 / 3",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 3 / 5 / 5",
      },
      {
        gridArea: "3 / 5 / 5 / 7",
      },
      {
        gridArea: "3 / 7 / 3 / 9",
      },
      {
        gridArea: "4 / 7 / 4 / 9",
      },
      {
        gridArea: "5 / 1 / 5 / 4",
      },
      {
        gridArea: "5 / 4 / 5 / 6",
      },
      {
        gridArea: "5 / 6 / 5 / 9",
      },
    ],
  ];


  ngOnInit(): void {
    if (this.selected === 'hotels') {
      this.shownGrid = this.gridStyleHotels;
      this.shownImages = this.images.length > 10 ? this.images.slice(0, 10) : this.images;
    } else {
      this.shownImages = this.images.length > 9 ? this.images.slice(0, 9) : this.images;
      this.shownGrid = this.gridStyle;
    }
  }


  protected flattenGridStyle(): any[] {
    return this.gridStyle.reduce((acc, val) => acc.concat(val), []);
  }

  protected getGridArea(index: number): string {
    const rowStart = Math.floor(index / 3) * 2 + 1;
    const rowEnd = rowStart + 2;
    const colStart = (index % 3) * 3 + 1;
    const colEnd = colStart + 3;
    return `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`;
  }

  fullScreenIcon() {
    return `pi ${this.display ? "pi-window-minimize" : "pi-window-maximize"}`;
  }
  toggleFullScreen() {
    this.display = !this.display;
  }

  updateCurrentImageIndex(index: number) {
    this.currentImageIndex = index;
    console.log(index);
  }

  public galleriaClass(): string {
    if (this.images?.length) {
      if (this.images.length > 99) {
        this.totalImages = 99;
      } else {
        this.totalImages = this.images.length;
      }
    }
    return `custom-galleria ${this.display ? "fullscreen" : ""}`;
  }

  handleImageError(event: any, url: string) {
    // try again with the url
    event.target.src = url;
  }
}
