import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BookingPage } from './booking.page';
import { SharedModule } from '../shared/shared.module';
import { TooltipsModule } from '../shared/sg-tooltips/tooltips.module';

const routes: Routes = [
  {
    path: '',
    component: BookingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    TooltipsModule.forRoot(),
  ],
  declarations: [BookingPage]
})
export class BookingPageModule {}
