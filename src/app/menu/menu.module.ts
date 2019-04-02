import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'all', loadChildren: './all/all.module#AllPageModule' },
      { path: 'categories', loadChildren: './categories/categories.module#CategoriesPageModule' },
      { path: 'products', loadChildren: './products/products.module#ProductsPageModule' },
    ],
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
  declarations: [MenuPage]
})
export class MenuPageModule {}
