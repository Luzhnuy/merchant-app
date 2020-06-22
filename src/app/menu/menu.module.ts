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
      {
        path: 'all',
        loadChildren: () => import('./all/all.module').then( m => m.AllPageModule),
      }, {
        path: 'categories',
        loadChildren: () => import('./categories/categories.module').then( m => m.CategoriesPageModule),

      }, {
        path: 'products',
        loadChildren: () => import('./products/products.module').then( m => m.ProductsPageModule),
      }, {
        path: 'options',
        loadChildren: () => import('./options/options.module').then( m => m.OptionsPageModule),
      },
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
