import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { UserServiceV2 } from '../shared/user-v2.service';
import { MerchantsService } from '../shared/merchants.service';
import { MerchantV2 } from '../shared/merchant-v2';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { take } from 'rxjs/operators';
import { OrderType } from '../shared/order-v2';
import { OrdersService } from '../shared/orders.service';
import { PaymentCard } from '../shared/payment-card';
import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { PaymentCardsService } from '../shared/payment-cards.service';
import { AskCreditCardModalComponent } from '../shared/components/modals/ask-credit-card-modal/ask-credit-card-modal.component';
import { DatePipe } from '@angular/common';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { from } from 'rxjs';
import { File } from '@ionic-native/file';
import { FileDownloaderService } from '../shared/file-downloader.service';

enum HumanTypes {
  Booking = 'Booking',
  App = 'App',
  All = 'All',
  Earnings = 'Earnings total',
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  sendReceiptEmail = false;
  fileData: any = null;
  uploader: FileUploader;
  merchant: MerchantV2 = null;
  logo: any;
  logoChanged = false;
  private subscrId: number;
  invalidDate = false;
  closeHour: string;
  openHour: string;
  get OpenHour() {
    return this.openHour ? +this.openHour.split(':')[0] : 10;
  }
  get CloseHour() {
    return this.closeHour ? +this.closeHour.split(':')[0] : 22;
  }
  dateChangeCounter = 0;
  rangeChangeCounter = 0;
  dateRange: Date[] = [];
  maxDate = new Date();
  reportTypes: HumanTypes[] = [ HumanTypes.Booking, HumanTypes.App, HumanTypes.All, HumanTypes.Earnings];
  selectedType: HumanTypes = HumanTypes.Booking;
  invalidReports = false;
  typesAssoc: {
    [key: string]: OrderType[];
  } = {
    [HumanTypes.Booking]: [OrderType.Booking, OrderType.Trip],
    [HumanTypes.App]: [OrderType.Menu],
    [HumanTypes.All]: [OrderType.Booking, OrderType.Menu, OrderType.Trip],
    [HumanTypes.Earnings]: [OrderType.Menu],
  };
  imageName: string;
  card: PaymentCard;
  isApp = false;

  private cameraOptions: CameraOptions;
  // private file: File;

  constructor(
    public userService: UserServiceV2,
    public merchantsService: MerchantsService,
    private zone: NgZone,
    private http: HttpClient,
    private helper: HelperService,
    private errorHandler: ErrorHandlerService,
    private ordersService: OrdersService,
    private modalController: ModalController,
    private alertController: AlertController,
    private paymentCardsService: PaymentCardsService,
    private platform: Platform,
    private datePipe: DatePipe,
    // private transfer: FileTransfer,
    private camera: Camera,
    private actionSheetController: ActionSheetController,
    // private file: File,
    private downloaderService: FileDownloaderService,
  ) {
    // this.file = new File();
    this.cameraOptions = {
      quality: 85,
      targetHeight: 800,
      targetWidth: 800,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };
  }

  ngOnInit() {
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
    this.merchantsService
      .$merchant
      .subscribe(merchant => {
        this.merchant = merchant;
        if (this.merchant.logo) {
          this.logo = environment.imageHost + this.merchant.logo;
        }
        this.logoChanged = false;
      });
    this.isApp = this.platform.is('cordova');
  }

  ionViewWillEnter() {
    this.merchantsService
      .$merchant
      .pipe(
        take(1),
      )
      .subscribe(merchant => {
        this.merchant = merchant;
        const department = merchant.departments[0];
        let hours = this.helper.leadWithZero(
          Math.floor(department.openHours / 60)
        );
        let minutes = this.helper.leadWithZero(
          merchant.departments[0].openHours % 60
        );
        this.openHour = `${hours}:${minutes}`;
        hours = this.helper.leadWithZero(
          Math.floor(department.closeHours / 60),
        );
        minutes = this.helper.leadWithZero(
          merchant.departments[0].closeHours % 60,
        );
        this.closeHour = `${hours}:${minutes}`;
      });
    this.loadCard();
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

  logout() {
    this.userService
      .logout()
      .subscribe(() => {
        window.location.reload();
      });
  }

  fileProgress(files: any) {
    this.fileData = files[0] as File;
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

  takePicture(sourceType: PictureSourceType, error?: string) {
    // this.logo = 'data:image/png;base64,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';
    // this.logoChanged = true;
    // return;
    this.cameraOptions.sourceType = sourceType;
    from(this.camera
      .getPicture(this.cameraOptions)
    )
      .subscribe(imageData => {
        this.zone.run(() => {
          this.logo = 'data:image/jpeg;base64,' + imageData;
          this.logoChanged = true;
        });
      }, err => {
        console.error(err);
      });
  }

  private preview() {
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader: any = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => this.zone.run(() => {
      this.logo = reader.result;
      this.logoChanged = true;
    });
  }

  timeChanged() {
    if (this.OpenHour >= this.CloseHour) {
      this.invalidDate = true;
    } else {
      this.invalidDate = false;
    }
    if (this.dateChangeCounter > 2) {
      if (!this.invalidDate) {
        this.updateOpeningTime();
      }
    } else {
      this.dateChangeCounter++;
    }
  }

  updateOpeningTime() {
    const department = this.merchant.departments[0];
    department.openHours = this.openHour
      .split(':')
      .reduce((res, el, idx) => {
        return res + (idx ? +el : +el * 60);
      }, 0);
    department.closeHours = this.closeHour
      .split(':')
      .reduce((res, el, idx) => {
        return res + (idx ? +el : +el * 60);
      }, 0);
    const merchant = new MerchantV2({
      id: this.merchant.id,
      departments: [ department ],
    }, true);
    this.merchantsService
      .update(merchant)
      .subscribe(() => this.showSuccess(), e => this.showError(e));
  }

  async selectImageMobile() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Camera',
        icon: 'camera',
        handler: () => {
          this.takePicture(
            this.camera.PictureSourceType.CAMERA,
          );
        }
      }, {
        text: 'Photo Library',
        icon: 'image',
        handler: () => {
          this.takePicture(
            this.camera.PictureSourceType.PHOTOLIBRARY,
          );
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  private showError(e) {
    const message = this.errorHandler.handleError(e);
    this.helper.showError(message);
  }

  private showSuccess() {
    this.helper.showToast('Opening Time has been changed successfully');
  }

  async onDateRangeChanged(range?) {
    if (range) {
      this.dateRange = range;
    }
    if (
      this.dateRange
      && this.dateRange.length === 2
      && this.dateRange[0].getTime() < this.dateRange[1].getTime()
    ) {
      this.invalidReports = false;
    } else {
      if (this.rangeChangeCounter > 2) {
        this.invalidReports = true;
      } else {
        this.rangeChangeCounter++;
      }
    }
  }

  download() {
    if (this.invalidReports || !this.dateRange || !this.dateRange.length) {
      return;
    }
    if (this.selectedType !== HumanTypes.Earnings) {
      this.downloadReport();
    } else {
      this.downloadInvoice();
    }
    return;
  }

  async toggleMenuActive($event) {
    this.merchant.enableMenu = $event;
    try {
      await this.merchantsService
        .update({
          id: this.merchant.id,
          enableMenu: $event,
        } as any)
        .toPromise();
    } catch (e) {
      console.error(e);
      this.helper
        .showError('Cannot enable Menu. Please, contact us');
    }
  }

  private getReportFileName(startDate: Date, endDate: Date, type: HumanTypes) {
    let fileName = `report-${type}`;
    fileName += this.datePipe.transform(startDate, 'MMM-d-y');
    fileName += '-';
    fileName += this.datePipe.transform(endDate, 'MMM-d-y');
    fileName += type === HumanTypes.Earnings ? '.pdf' : '.csv';
    return fileName;
  }

  private downloadBrowser(link) {
    window.open(link, '_blank');
  }

  async openEditCardModal() {
    const modal = await this.modalController.create({
      component: AskCreditCardModalComponent,
      componentProps: {
        card: this.card,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadCard();
    }
  }

  private loadCard() {
    this.paymentCardsService
      .getAll()
      .subscribe(cards => {
        if (cards.length) {
          this.card = new PaymentCard(cards[0]);
          this.imageName = this.getSrc();
        }
      });
  }

  private getSrc() {
    switch (this.card.brand) {
      case 'Visa':
        return 'visa.png';
      case 'MasterCard':
        return 'mastercard.png';
      case 'American Express':
        return 'amex.png';
      default:
        return 'card_pay.png';
    }
  }

  private async downloadInvoice() {
    try {
      const { params, startDate, endDate } = await this.getDownloadParams();
      const link = this.ordersService.getInvoiceLink(params);
      await this.saveReport(link, startDate, endDate);
    } catch (e) {
      console.error(e);
    }
  }

  private async downloadReport() {
    try {
      const { params, startDate, endDate } = await this.getDownloadParams();
      const link = this.ordersService.getReportLink(params);
      await this.saveReport(link, startDate, endDate);
    } catch (e) {
      console.error(e);
    }
  }

  private async getDownloadParams() {
    const startDate = new Date(this.dateRange[0].getTime());
    const endDate = new Date(this.dateRange[1].getTime());
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(24, 0, 0, 0);
    const token = await this.userService.getOneTimeAuthToken().toPromise();
    const params = {
      token,
      limit: 9999,
      page: 0,
      range: [
        startDate.toISOString(),
        endDate.toISOString(),
      ],
      timezoneOffset: startDate.getTimezoneOffset(),
      types: this.typesAssoc[this.selectedType],
    };
    return { params, startDate, endDate };
  }

  async saveFile(link, startDate, endDate, type: HumanTypes) {
    if (this.isIOsOrAndroid()) {
      try {
        const blob = await this.downloaderService
          .download(link);
        await this.downloaderService
          .save(this.getReportFileName(startDate, endDate, this.selectedType), blob, blob.type);
        await this.helper.showToast('Report was saved successfully');
      } catch (e) {
        console.error(e);
        await this.helper.showToast('Problems with downloading file');
      }
    } else {
      this.downloadBrowser(link);
    }
  }

  async saveReport(link, startDate, endDate) {
    if (this.isIOsOrAndroid()) {
      if (!this.platform.is('cordova')) {
        const storeUrl = this.platform
          .is('ios') ?
          'https://apps.apple.com/app/id1523073977' :
          'market://details?id=com.snapgrabdelivery.apps.merchants';
        const alert = await this.alertController.create({
          // header: 'Alert',
          // subHeader: 'Subtitle',
          message: `This functionality is unavailable in browser.
            Please, use <a href="${storeUrl}"><b>SnapGrab for Merchants</b></a> app.`,
          buttons: [
            // 'Use browser', 'Download app',
            {
              text: 'Use browser',
              role: 'cancel',
              cssClass: 'secondary',
            }, {
              text: 'Download app',
              handler: () => {
                window.location.href = storeUrl;
                console.log('Confirm Okay');
              }
            }
          ],
        });
        await alert.present();
        return;
      }
      try {
        const blob = await this.downloaderService
          .download(link);
        await this.downloaderService
          .save(this.getReportFileName(startDate, endDate, this.selectedType), blob, blob.type);
        await this.helper.showToast('Report was saved successfully');
      } catch (e) {
        console.error(e);
        await this.helper.showToast('Problems with downloading file');
      }
    } else {
      this.downloadBrowser(link);
    }
  }

  private isIOsOrAndroid() {
    return this.platform.is('ios') || this.platform.is('android');
  }
}
