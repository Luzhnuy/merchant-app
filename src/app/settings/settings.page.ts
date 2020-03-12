import { Component, NgZone, OnInit } from '@angular/core';
import { UserServiceV2 } from '../shared/user-v2.service';
import { MerchantsService } from '../shared/merchants.service';
import { MerchantV2 } from '../shared/merchant-v2';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  sendReceiptEmail = false;
  fileData: File = null;
  uploader: FileUploader;

  merchant: MerchantV2 = null;
  logo: any;

  logoChanged = false;

  private subscrId: number;

  constructor(
    public userService: UserServiceV2,
    public merchantsService: MerchantsService,
    private zone: NgZone,
  ) {
    this.uploader = new FileUploader({
      disableMultipart: true,
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item) => {
        return new Promise( (resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date()
          });
        });
      }
    });
  }

  ngOnInit() {
    this.merchantsService
      .$merchant
      .subscribe(merchant => {
        this.merchant = merchant;
        if (this.merchant.logo) {
          this.logo = environment.imageHost + this.merchant.logo;
        }
        this.logoChanged = false;
      });
  }

  changeReceiptSubscription(res) {
    const savingData = new MerchantV2({
      id: this.merchant.id,
      subscribedOnReceipt: res,
    }, true);
    this.merchantsService
      .update(savingData)
      .subscribe();
  }

  fileProgress(files: any) {
    this.fileData = <File>files[0];
    if (this.fileData) {
      this.preview();
    }
  }

  saveImage() {
    const savingData = new MerchantV2({
      id: this.merchant.id,
      logo: this.logo,
    }, true);
    this.merchantsService
      .update(savingData)
      .subscribe(
        res => {
          if (res.logo) {
            this.logo = environment.imageHost + res.logo;
            this.logoChanged = false;
          }
        }
      );
  }

  private preview() {
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => this.zone.run(() => {
      this.logo = <any>reader.result;
      this.logoChanged = true;
    });
  }

}
