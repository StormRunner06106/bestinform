import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ComingSoonComponent } from './coming-soon.component';

export const routes: Routes = [
  { path: '', component: ComingSoonComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
   ComingSoonComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule 
  ]
})
export class ComingSoonModule { }
