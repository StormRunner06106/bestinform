import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ToastService} from "../../../shared/_services/toast.service";
import {HotelsService} from "../../../shared/_services/hotels.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {HotelMarkupDialogComponent} from "./dialog/hotel-markup-dialog.component";
import {MatSort, Sort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";

export interface HotelMarkup {
    id: string;
    name: string;
    bestinform_markup: number;
}
@Component({
    selector: 'app-countries',
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit, AfterViewInit {

    @ViewChild("paginator", {static: false}) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns: string[] = ['id', 'name', 'bestinform_markup', 'action'];
    dataSource: MatTableDataSource<HotelMarkup>;
    filter: string;
    page: any;
    pageOptions = {
        page: 0,
        size: 20
    }


    constructor(private toastService: ToastService,
                private hotelsService: HotelsService,
                private dialog: MatDialog) {
    }

    async ngOnInit() {
        this.dataSource = new MatTableDataSource<HotelMarkup>([]);
        const res = await this.hotelsService.listHotelsPageMarkup(this.pageOptions);
        this.changeDataSource(res);
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }


    private changeDataSource(page: any) {
        this.dataSource = new MatTableDataSource(page.content);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.page = page;

    }

    editHotelMarkup(row: HotelMarkup) {
        const dialogRef = this.dialog.open(HotelMarkupDialogComponent, {
            width: "50vw",
            height: "50vh",
            data: {
                add: false,
                hotelMarkup: row
            }
        });
        dialogRef.afterClosed().subscribe(async (res) => {
            if (res) {
                this.pageOptions = {
                    page: 0,
                    size: 20
                }
                const res = await this.hotelsService.listHotelsPageMarkup(this.pageOptions);
                this.changeDataSource(res.content);
            }
        })
    }

    addMarkup() {
        const dialogRef = this.dialog.open(HotelMarkupDialogComponent, {
            width: "50vw",
            height: "50vh",
            data: {
                add: true,
                hotelMarkup: {

                }
            }
        });
        dialogRef.afterClosed().subscribe(async (res) => {
            if (res) {
                this.pageOptions = {
                    page: 0,
                    size: 20
                }
                const res = await this.hotelsService.listHotelsPageMarkup(this.pageOptions);
                this.changeDataSource(res);
            }
        })
    }

    async applyFilter($event: any) {
        this.filter = $event.target.value;
        const res = await this.hotelsService.listHotelsPageMarkup({...this.pageOptions, filter: this.filter});
        this.changeDataSource(res);
    }

    async sortChanged($event: Sort) {
        const res = await this.hotelsService.listHotelsPageMarkup({...this.pageOptions, filter: this.filter, sort: $event});
        this.changeDataSource(res);
    }

    clearAndReload() {
        this.applyFilter({target: {value: null}});
    }
}
