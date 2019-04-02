import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrdersListPage } from './orders-list.page';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: OrdersListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [OrdersListPage]
})
export class OrdersListPageModule {}
