import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { OrderPage } from './order.page';
// import { Printer } from '@ionic-native/printer/ngx';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        component: OrderPage,
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [OrderPage],
  providers: [
    DatePipe,
    // Printer,
  ]
})
export class OrderPageModule {}
