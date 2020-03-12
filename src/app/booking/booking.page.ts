import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AskCreditCardModalComponent } from '../shared/ask-credit-card-modal/ask-credit-card-modal.component';
import { DatePipe } from '@angular/common';
import { HelperService } from '../shared/helper.service';
import { ConfirmOrderModalComponent } from '../shared/confirm-order-modal/confirm-order-modal.component';
import { OrderPrepareRequestData } from '../shared/order-interfaces';
import { OrderType, OrderV2 } from '../shared/order-v2';
import { MerchantsService } from '../shared/merchants.service';
import { MerchantV2 } from '../shared/merchant-v2';
import { OrdersService } from '../shared/orders.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { PaymentCardsService } from '../shared/payment-cards.service';
import { PaymentCard } from '../shared/payment-card';

interface OrderExtras {
  baseFare: number;
  distanceFare: number;
  largeOrderFare: number;
  surgeTime: boolean;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  providers: [DatePipe],
})
export class BookingPage implements OnInit {

  @ViewChild('form', { static: false }) form: NgForm;

  enabledBooking: boolean;

  apiError: string = null;

  name: string;
  address: string;
  zipcode: string;
  date: string;             // format 2019-01-01 or 2019-01-01 00:00:00 (be careful)
  time: string;             // format 00:00
  instruction: string;
  phone: string;
  bringBack = false;
  largeOrder = false;

  dateInvalid = false;
  timeInvalid = false;
  addressInvalid = true;

  minYear: number;
  maxYear: number;

  extras: OrderExtras;

  private formatted_address: string;
  private distance: string;

  private readonly MIN_HOURS = 10;
  private readonly MAX_HOURS = 22;

  private shortDate: string; // format 2019-01-01
  private shortTime: string; // format 00:00:00

  private googlePlaceAddress: Address;

  readonly placesOptions = {
    types: ['address'],
    componentRestrictions: {
      country: 'ca'
    }
  };

  private zipcodeszone = ['H2G', 'H3J', 'H3Z', 'H3Y', 'H3H', 'H3V', 'H3T', 'H2V', 'H3G', 'H3A',
    'H3B', 'H2Z', 'H2Y', 'H2X', 'H2W', 'H2T', 'H2J', 'H2L', 'H2H', 'H5B', 'H4Z', 'H5A', 'H3C',
    'H4C', 'H1Y', 'H1V', 'H1W', 'H1X', 'H3C', 'H4B', 'H2K', 'H3P', 'H4V', 'H3R', 'H2S', 'H3K',
    'H3S', 'H3X', 'H3Y', 'H4G', 'H4A', 'H4E', 'H3W',
  ];

  private zipcodeszone1 = ['J4H', 'J4G', 'J4R', 'J4S', 'J4W', 'J4X', 'J4P', 'H2N', 'H2P', 'H2R',
    'H1A', 'H1B', 'H1C', 'H1E', 'H1G', 'H1H', 'H1J', 'H1K', 'H1M', 'H1L', 'H1N', 'H1P', 'H1R',
    'H1S', 'H1T', 'H1Z', 'H2A', 'H2B', 'H2C', 'H2E', 'H2M', 'H3E', 'H3L', 'H3M', 'H3N', 'H4H',
    'H4J', 'H4K', 'H4L', 'H4M', 'H4N', 'H4P', 'H4R', 'H4S', 'H4T', 'H4W', 'H4X', 'H4Y',
    'H8N', 'H8P', 'H8R', 'H8S', 'H8T', 'H8Y', 'H8Z', 'H9A', 'H9B', 'H9C', 'H9E', 'H9G', 'H9H',
    'H9J', 'H9K', 'H9P', 'H9R', 'H9S', 'H9W', 'H9X'
  ];

  // new
  private merchant: MerchantV2;
  public order: OrderV2;
  public card: PaymentCard;

  constructor(
    public alertController: AlertController,
    private toastController: ToastController,
    private ordersService: OrdersService,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private helper: HelperService,
    private merchantsService: MerchantsService,
    private errorHandlerService: ErrorHandlerService,
    private paymentCardsService: PaymentCardsService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.order = new OrderV2();
    this.merchantsService
      .$merchant
      .subscribe(merchant => {
        this.merchant = merchant;
        this.enabledBooking = this.merchant.enableBooking;
        if (!this.enabledBooking) {
          this.helper
            .showError(
              'Your Bookings service is disabled. Contact SnapGrab for more information.',
              undefined,
              undefined,
              10000,
            );
        }
      });
    this.paymentCardsService
      .getAll()
      .subscribe(cards => {
        if (cards.length) {
          this.card = new PaymentCard(cards[0]);
        }
      });
    this.initData();
  }

  async createOrder() {
    if (!this.card) {
      await this.askCreditCard();
    }
    if (!this.card) {
      return;
    }
    const confirm = await this.askConfirmation();
    if (!confirm) {
      return;
    }
    this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
    if (this.timeInvalid || this.dateInvalid) {
      return;
    }
    try {
      await this.helper.showLoading('Creating order. Please wait...', 10000);
      this.applyFormDataToOrder();
      await this.ordersService
        .create(this.order)
        .toPromise();
      this.toastController.create({
        message: 'Order was created successfully!',
        duration: 3000,
        color: 'success',
        position: 'top',
      })
        .then(t => {
          t.present();
        });
      this.initData();
    } catch (e) {
      this.apiError = this.errorHandlerService.handleError(e);
    } finally {
      await this.helper.stopLoading();
    }
  }

  async handleAddressChange($event) {
    this.addressInvalid = false;
    const longZipcode = $event.address_components.find(cmp => {
      return cmp.types.indexOf('postal_code') > -1;
    });
    const shortZipcode = longZipcode ? longZipcode.long_name.substring(0, 3) : '';
    this.zipcode = shortZipcode;
    this.formatted_address = $event.formatted_address;
    this.googlePlaceAddress = $event;
    this.order.metadata.distance = null;
    this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
  }

  async recalculatePrices() {
    this.addressInvalid = false;
    if (this.zipcodeszone.indexOf(this.zipcode) > -1 || this.zipcodeszone1.indexOf(this.zipcode) > -1) {
      const data = this.getPreparePriceRequestData();
      try {
        const preparedOrder = await this.ordersService
          .prepareOrder(data)
          .toPromise();
        this.extras = (preparedOrder as any).extras;
        (preparedOrder as any).extras = null;
        delete (preparedOrder as any).extras;
        Object.assign(this.order.metadata, preparedOrder);
        this.distance = (this.order.metadata.distance / 1000).toFixed(2);
      } catch (e) {
        this.apiError = this.errorHandlerService.handleError(e);
      }
    } else {
      this.addressInvalid = true;
    }
  }

  dateChanged({detail: {value}}) {
    this.shortDate = value.substring(0, 10);
    const date = this.getSelectDateTime();
    const now = this.getNow(!this.shortTime);
    if (now.getTime() > date.getTime()) {
      this.dateInvalid = true;
    } else {
      this.dateInvalid = false;
    }
  }

  async timeChanged({detail: {value}}) {
    this.shortTime = value + ':00';
    const timeCmps = value.split(':').map(v => +v);
    const timeHM = {
      h: timeCmps[0],
      m: timeCmps[1],
    };
    const minH = this.MIN_HOURS;
    let maxH = this.MAX_HOURS;
    if (timeHM.m) {
      maxH = 21;
    }
    this.timeInvalid = !(timeHM.h >= minH && timeHM.h <= maxH);

    if (!this.timeInvalid && this.date) {
      const date = this.getSelectDateTime();
      const now = this.getNow();
      this.dateInvalid = now.getTime() >= date.getTime();
    }

    if (!this.timeInvalid) {
      await this.recalculatePrices();
    }
  }

  public getSrc() {
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

  private initData() {
    this.form.reset();

    this.order = new OrderV2();
    this.name = '';
    this.address = '';
    this.zipcode = '';
    this.date = '';
    this.time = '';
    this.instruction = '';
    this.phone = '';

    this.dateInvalid = false;
    this.timeInvalid = false;
    this.addressInvalid = true;

    const now = this.getNow();
    const curYear = now.getFullYear();
    this.time = this.getDefDeliveryTime();
    this.date = this.getDefDeliveryDate();
    this.minYear = curYear;
    this.maxYear = curYear + 1;

    this.shortDate = this.date.substring(0, 10);
    this.shortTime = this.time + ':00';
    this.extras = null;
  }

  private getDefDeliveryTime() {
    const now = this.getNow();
    const hours = now.getHours() + 1;
    const minutes = now.getMinutes();
    if (
      (minutes > 0 && hours > this.MAX_HOURS - 1)
      || (minutes === 0 && hours > this.MAX_HOURS)
      || hours < this.MIN_HOURS
    ) {
      return '10:00';
    }
    return ('0' + (now.getHours() + 1)).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
  }

  private getDefDeliveryDate() {
    const now = this.getNow();
    const hours = now.getHours() + 1;
    const minutes = now.getMinutes();
    if (
      (minutes > 0 && hours > this.MAX_HOURS - 1)
      || (minutes === 0 && hours > this.MAX_HOURS)
    ) {
      now.setDate(now.getDate() + 1);
    }
    return now.getFullYear() + '-'
      + this.leadWithZero(now.getMonth() + 1) + '-'
      + this.leadWithZero(now.getDate()) + ' '
      + '00:00:00';
  }

  private getSelectDateTime(): Date {
    const dateStr = `${this.shortDate}T${this.shortTime}`;
    let date: Date;
    if (this.googlePlaceAddress) {
      // Selected location timezone
      date = new Date(this.getFormatDateString(dateStr));
    } else {
      // Operator's timezone
      date = new Date(dateStr);
    }
    return date;
  }

  /**
   * Returns formatted date string with location timezone
   * @param dateStr string format 2019-06-06T11:45:22
   */
  private getFormatDateString(dateStr, additionalOffset = 0): string {
    return dateStr + this.getTimezoneOffsetString(additionalOffset);
  }

  private getTimezoneOffsetString(additionalOffset = 0, inverse = false) {
    const timeOffset = this.googlePlaceAddress.utc_offset + additionalOffset;
    const hoursOffset = Math.abs(Math.floor(timeOffset / 60));
    const minutesOffset = Math.abs(timeOffset % 60);
    if (!inverse) {
      return (timeOffset >= 0 ? '+' : '-') + this.leadWithZero(hoursOffset) + ':' + this.leadWithZero(minutesOffset);
    } else {
      return (timeOffset < 0 ? '+' : '-') + this.leadWithZero(hoursOffset) + ':' + this.leadWithZero(minutesOffset);
    }
  }

  private leadWithZero(number) {
    return ('0' + number).slice(-2);
  }

  private getNow(clearTime = false): Date {
    const now = new Date();

    if (clearTime) {
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);
    }

    return now;
  }

  private async askCreditCard() {
    try {
      const modal = await this.modalController.create({
        component: AskCreditCardModalComponent,
        componentProps: {
          card: this.card,
        }
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      this.card = data;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  private async askConfirmation() {
    const startDate = new Date(`${this.shortDate}T${this.shortTime}+00:00`);
    const endDate = new Date();
    endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
    const modal = await this.modalController.create({
      component: ConfirmOrderModalComponent,
      componentProps: {
        startTime: startDate,
        endTime: endDate,
        address: this.formatted_address,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    return !!data;
  }


  private getPreparePriceRequestData() {
    const scheduledTime = this.shortTime.split(':').reduce((res, val, i) => {
      switch (i) {
        case 0:
          res += parseInt(val, 10) * 60;
          break;
        case 1:
          res += parseInt(val, 10);
          break;
      }
      return res;
    }, 0);
    const data: OrderPrepareRequestData = {
      // distance: this.order.metadata.distance || null,
      origin: {
        lat: this.merchant.departments[0].latitude,
        lon: this.merchant.departments[0].longitude,
      },
      destination: {
        lat: this.googlePlaceAddress.geometry.location.toJSON().lat,
        lon: this.googlePlaceAddress.geometry.location.toJSON().lng,
      },
      type: OrderType.Booking,
      discount: 0,
      largeOrder: this.largeOrder,
      bringBack: this.bringBack,
      scheduledTime,
    };
    return data;
  }

  private applyFormDataToOrder() {
    this.order.scheduledAt = this.getFormatDateString(`${this.shortDate}T${this.shortTime}`);
    this.order.metadata.description = `Booking Form Instruction: ${this.instruction}`;
    this.order.metadata.pickUpLat = this.merchant.departments[0].latitude;
    this.order.metadata.pickUpLon = this.merchant.departments[0].longitude;
    this.order.metadata.pickUpTitle = this.merchant.name;
    this.order.metadata.pickUpAddress = this.merchant.departments[0].address;
    this.order.metadata.pickUpPhone = this.merchant.phone;
    this.order.metadata.pickUpEmail = this.merchant.email;
    this.order.metadata.dropOffLat = this.googlePlaceAddress.geometry.location.toJSON().lat;
    this.order.metadata.dropOffLon = this.googlePlaceAddress.geometry.location.toJSON().lng;
    this.order.metadata.dropOffTitle = this.name;
    this.order.metadata.dropOffAddress = this.formatted_address;
    this.order.metadata.dropOffPhone = this.phone;
    this.order.metadata.utcOffset = this.googlePlaceAddress.utc_offset;
  }
}
