import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectBtPrinterPage } from './select-bt-printer.page';

const routes: Routes = [
  {
    path: '',
    component: SelectBtPrinterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SelectBtPrinterPage]
})
export class SelectBtPrinterPageModule {}
