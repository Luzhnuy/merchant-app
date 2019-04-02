import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { StatusBadgeComponent } from './status-badge/status-badge.component';
import { MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { FormsModule } from '@angular/forms';
import { ProductEyeButtonComponent } from './buttons/product-eye-button/product-eye-button.component';
import { CategoryEyeButtonComponent } from './buttons/category-eye-button/category-eye-button.component';
import { ProductDeleteButtonComponent } from './buttons/product-delete-button/product-delete-button.component';
import { CategoryDeleteButtonComponent } from './buttons/category-delete-button/category-delete-button.component';
import { BackButtonComponent } from './buttons/back-button/back-button.component';
import { AddProductButtonComponent } from './buttons/add-product-button/add-product-button.component';
import { AddProductButtonBigComponent } from './buttons/add-product-button-big/add-product-button-big.component';
import { AddCategoryButtonComponent } from './buttons/add-category-button/add-category-button.component';

@NgModule({
  declarations: [
    OrderDetailsComponent,
    StatusBadgeComponent,
    BackButtonComponent,
    AddProductButtonComponent,
    AddProductButtonBigComponent,
    AddCategoryButtonComponent,
    ProductModalComponent,
    CategoryModalComponent,
    ProductEyeButtonComponent,
    CategoryEyeButtonComponent,
    ProductDeleteButtonComponent,
    CategoryDeleteButtonComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    FormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    // OrdersHistoryService,
  ],
  entryComponents: [
    ProductModalComponent,
    CategoryModalComponent,
  ],
  exports: [
    OrderDetailsComponent,
    StatusBadgeComponent,
    BackButtonComponent,
    AddProductButtonComponent,
    AddProductButtonBigComponent,
    AddCategoryButtonComponent,
    ProductModalComponent,
    CategoryModalComponent,
    ProductEyeButtonComponent,
    CategoryEyeButtonComponent,
    ProductDeleteButtonComponent,
    CategoryDeleteButtonComponent,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ]
})
export class SharedModule {}
