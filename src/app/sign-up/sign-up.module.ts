import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignUpPage } from './sign-up.page';
import { SharedModule } from '../shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AddressAutocompleteDirective } from './address-autocomplete.directive';

const routes: Routes = [
  {
    path: '',
    component: SignUpPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    // GooglePlaceModule,
  ],
  declarations: [ SignUpPage, AddressAutocompleteDirective, ]
})
export class SignUpPageModule {}
