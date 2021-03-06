import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AllPage } from './all.page';
import { SharedModule } from '../../shared/shared.module';
import {CategoryItemComponent} from "./category-item/category-item.component";
// import { CategoryModalComponent } from '../../shared/category-modal/category-modal.component';

const routes: Routes = [
  {
    path: '',
    component: AllPage
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
  // entryComponents: [
  //   CategoryModalComponent,
  // ],
  declarations: [
    AllPage,
    CategoryItemComponent,
  ]
})
export class AllPageModule {}
