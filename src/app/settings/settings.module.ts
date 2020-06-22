import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SettingsPage } from './settings.page';
import { SharedModule } from '../shared/shared.module';
// import { FileTransfer } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file/ngx';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
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
  declarations: [SettingsPage],
  providers: [
    DatePipe,
    // FileTransfer,
    // File,
  ]
})
export class SettingsPageModule {}
