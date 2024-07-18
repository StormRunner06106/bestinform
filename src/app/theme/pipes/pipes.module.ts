import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlightDurationPipe} from "../../shared/_pipes/flight-duration.pipe";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FlightDurationPipe
    ],
    exports: [
        FlightDurationPipe
    ]
})
export class PipesModule { }
