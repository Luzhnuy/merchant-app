import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BookingPage } from './booking.page';
import { SharedModule } from '../shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { TooltipsModule } from 'ionic-tooltips';

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
    GooglePlaceModule,
    TooltipsModule.forRoot(),
  ],
  declarations: [BookingPage]
})
export class BookingPageModule {}
