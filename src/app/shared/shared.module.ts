import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ProductModalComponent } from './components/modals/product-modal/product-modal.component';
import { CategoryModalComponent } from './components/modals/category-modal/category-modal.component';
import { FormsModule } from '@angular/forms';
import { ProductEyeButtonComponent } from './components/buttons/product-eye-button/product-eye-button.component';
import { CategoryEyeButtonComponent } from './components/buttons/category-eye-button/category-eye-button.component';
import { ProductDeleteButtonComponent } from './components/buttons/product-delete-button/product-delete-button.component';
import { CategoryDeleteButtonComponent } from './components/buttons/category-delete-button/category-delete-button.component';
import { BackButtonComponent } from './components/buttons/back-button/back-button.component';
import { AddProductButtonComponent } from './components/buttons/add-product-button/add-product-button.component';
import { AddProductButtonBigComponent } from './components/buttons/add-product-button-big/add-product-button-big.component';
import { AddCategoryButtonComponent } from './components/buttons/add-category-button/add-category-button.component';
import { EditCreditCardComponent } from './components/edit-credit-card/edit-credit-card.component';
import { PrintPopoverComponent } from './components/print-popover/print-popover.component';
import { AskCreditCardModalComponent } from './components/modals/ask-credit-card-modal/ask-credit-card-modal.component';
import { SelectBtPrinterModalComponent } from './components/modals/select-bt-printer-modal/select-bt-printer-modal.component';
import { ConfirmOrderModalComponent } from './components/modals/confirm-order-modal/confirm-order-modal.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ApiV2Service } from './api-v2.service';
import { AddOptionButtonComponent } from './components/buttons/add-option-button/add-option-button.component';
import { AddSubOptionButtonComponent } from './components/buttons/add-sub-option-button/add-sub-option-button.component';
import { AddOptionItemButtonComponent } from './components/buttons/add-option-item-button/add-option-item-button.component';
import { DeleteOptionButtonComponent } from './components/buttons/delete-option-button/delete-option-button.component';
import { DeleteSubOptionButtonComponent } from './components/buttons/delete-sub-option-button/delete-sub-option-button.component';
import { OptionModalComponent } from './components/modals/option-modal/option-modal.component';
import { SubOptionModalComponent } from './components/modals/sub-option-modal/sub-option-modal.component';
import { OptionItemModalComponent } from './components/modals/option-item-modal/option-item-modal.component';
import { OptionEyeButtonComponent } from './components/buttons/option-eye-button/option-eye-button.component';
import { SubOptionEyeButtonComponent } from './components/buttons/sub-option-eye-button/sub-option-eye-button.component';
import { CalendarModule } from 'ion2-calendar';
import { SgDateRangeDirective } from './directives/sg-date-range.directive';
import { Camera } from '@ionic-native/camera/ngx';
import { AddressAutocompleteDirective } from './directives/address-autocomplete.directive';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

const publicModules = [
  FileUploadModule,
  CalendarModule,
];

const publicComponents = [
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
  EditCreditCardComponent,
  PrintPopoverComponent,
  AskCreditCardModalComponent,
  SelectBtPrinterModalComponent,
  ConfirmOrderModalComponent,
  AddOptionButtonComponent,
  AddSubOptionButtonComponent,
  AddOptionItemButtonComponent,
  DeleteOptionButtonComponent,
  DeleteSubOptionButtonComponent,
  OptionModalComponent,
  SubOptionModalComponent,
  OptionItemModalComponent,
  OptionEyeButtonComponent,
  SubOptionEyeButtonComponent,
];

const publicDirective = [
  SgDateRangeDirective,
  AddressAutocompleteDirective,
]

@NgModule({
  declarations: [
    ...publicComponents,
    ...publicDirective,
  ],
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    FormsModule,
    CalendarModule,
    ...publicModules,
  ],
  providers: [
    ApiV2Service,
    Camera,
    FileOpener,
    NativeAudio,
    OneSignal,
  ],
  entryComponents: [
    ProductModalComponent,
    CategoryModalComponent,
    AskCreditCardModalComponent,
    SelectBtPrinterModalComponent,
    ConfirmOrderModalComponent,
    OptionModalComponent,
    SubOptionModalComponent,
    OptionItemModalComponent,
  ],
  exports: [
    ...publicModules,
    ...publicComponents,
    ...publicDirective,
  ]
})
export class SharedModule {}
