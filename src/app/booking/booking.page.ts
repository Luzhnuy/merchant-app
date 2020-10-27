import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AskCreditCardModalComponent } from '../shared/components/modals/ask-credit-card-modal/ask-credit-card-modal.component';
import { DatePipe } from '@angular/common';
import { HelperService } from '../shared/helper.service';
import { ConfirmOrderModalComponent } from '../shared/components/modals/confirm-order-modal/confirm-order-modal.component';
import { OrderPrepareData, OrderPrepareRequestData } from '../shared/order-interfaces';
import { OrderType, OrderV2 } from '../shared/order-v2';
import { MerchantsService } from '../shared/merchants.service';
import { MerchantV2 } from '../shared/merchant-v2';
import { OrdersService } from '../shared/orders.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { PaymentCardsService } from '../shared/payment-cards.service';
import { PaymentCard } from '../shared/payment-card';
import { ApiV2Service } from '../shared/api-v2.service';
import { ZipcodesLists } from '../sign-up/sign-up.page';
import { skipWhile, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, Subject } from 'rxjs';

interface OrderExtras {
  baseFare: number;
  distanceFare: number;
  largeOrderFare: number;
  surgeTime: boolean;
}

interface OrderPrepareDataWithExtras extends OrderPrepareData {
  extras: OrderExtras;
}

class TripOrderData {
  name: string;
  address: string;
  phone: string;

  tmpId = parseInt((new Date()).getTime().toString() + Math.round(Math.random() * 1000).toString(), 10);
  time: string;
  addressInvalid = true;
  zipcode: string;
  formattedAddress: string;
  googlePlaceAddress: Address;
  totals: OrderPrepareDataWithExtras;
}

enum BringBackOnUnavailableOptions {
  leave = 'Leave at door/lobby/reception',
  bringBack = 'Return delivery to pick-up location',
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
  bringBackOnUnavailable = false;
  bringBackOnUnavailableOptions: Array<BringBackOnUnavailableOptions> = [
    BringBackOnUnavailableOptions.leave,
    BringBackOnUnavailableOptions.bringBack,
  ];

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

  private availableZipcodes: string[];
  private readonly endpointZipcodes = 'zipcodes';

  // new
  private merchant: MerchantV2;
  public order: OrderV2;
  public card: PaymentCard;

  public orderType = OrderType.Booking;
  public OrderType = OrderType;

  public tripOrders: OrderV2[];
  public tripOrdersData: TripOrderData[];
  public totals: OrderPrepareDataWithExtras;
  public minTripOrders: number;

  private destroyed$ = new EventEmitter();

  constructor(
    private toastController: ToastController,
    private ordersService: OrdersService,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private helper: HelperService,
    private merchantsService: MerchantsService,
    private errorHandlerService: ErrorHandlerService,
    private paymentCardsService: PaymentCardsService,
    private apiClientService: ApiV2Service,
  ) { }

  ngOnInit() {
    this.apiClientService
      .get(`${this.endpointZipcodes}/lists`)
      .subscribe((lists: { [key: string ]: { zipcode: string }[]; }) => {
        this.availableZipcodes = lists[ZipcodesLists.Merchants].map(zipcode => zipcode.zipcode);
      });
  }

  ionViewWillLeave() {
    this.destroyed$
      .emit();
  }

  ionViewWillEnter() {
    this.order = new OrderV2();
    this.merchantsService
      .$merchant
      .pipe(
        takeUntil(this.destroyed$),
        skipWhile(merchant => !merchant),
      )
      .subscribe(merchant => {
        this.merchant = merchant;
        if (this.merchant) {
          this.enabledBooking = this.merchant.enableBooking;
        } else {
          this.enabledBooking = false;
        }
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

  switchType(type: OrderType) {
    if (this.orderType === OrderType.Booking && type === OrderType.Trip) {
      setTimeout(() => {
        this.address = this.formatted_address;
      }, 100);
    } else if (this.orderType === OrderType.Trip && type === OrderType.Booking) {
      setTimeout(() => {
        this.tripOrdersData
          .forEach(data => {
            data.address = data.formattedAddress;
          });
      }, 100);
    }
    this.orderType = type;
    this.totals = null;
    if (this.shortTime) {
      this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
    }
  }

  bringBackOnUnavailableOptionChanged(option) {
    this.bringBackOnUnavailable = option.detail.value === BringBackOnUnavailableOptions.bringBack;
  }

  addNewBookingOrder() {
    this.tripOrders.push(new OrderV2({ type: OrderType.Trip }));
    this.tripOrdersData.push(new TripOrderData());
    if (this.shortTime) {
      this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
    }
  }

  removeNewBookingOrder(idx) {
    this.tripOrders.splice(idx, 1);
    this.tripOrdersData.splice(idx, 1);
    if (this.shortTime) {
      this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
    }
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
      await this.helper.showLoading('Creating order. Please wait...', 30000);
      if (this.orderType === OrderType.Booking) {
        this.applyFormDataToOrder();
        await this.ordersService
          .create(this.order)
          .toPromise();
      } else {
        this.applyFormDataToTripOrders();
        await this.ordersService
          .createTrip(this.tripOrders)
          .toPromise();
      }
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

  async handleAddressChange($event, idx?: number) {
    this.addressInvalid = false;
    const longZipcode = $event.address_components.find(cmp => {
      return cmp.types.indexOf('postal_code') > -1;
    });
    const shortZipcode = longZipcode ? longZipcode.long_name.substring(0, 3) : '';
    if (this.orderType === OrderType.Booking) {
      this.zipcode = shortZipcode;
      this.formatted_address = $event.formatted_address;
      this.googlePlaceAddress = $event;
      this.order.metadata.distance = null;
    } else {
      const data = this.tripOrdersData[idx];
      data.time = null;
      data.addressInvalid = false;
      data.zipcode = shortZipcode;
      data.formattedAddress = $event.formatted_address;
      data.googlePlaceAddress = $event;
      const order = this.tripOrders[idx];
      order.metadata.distance = null;
    }
    this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
  }

  async recalculatePrices() {
    this.addressInvalid = false;
    if (this.orderType === OrderType.Booking) {
      if (this.isValidZipcode(this.zipcode)) {
        const data = this.getPreparePriceRequestData();
        try {
          this.totals = await this.calcPricesForOrder(data);
        } catch (e) {
          this.apiError = this.errorHandlerService.handleError(e);
        }
      } else {
        this.addressInvalid = true;
      }
    } else {
      for (const data of this.tripOrdersData) {
        if (!data.zipcode || !this.isValidZipcode(data.zipcode)) {
          data.addressInvalid = true;
          this.addressInvalid = true;
        } else {
          if (data.address && (!data.time || data.time !== this.shortTime)) {
            try {
              const requestData = this.getPreparePriceRequestData(data.googlePlaceAddress);
              data.totals = await this.calcPricesForOrder(requestData);
              data.time = this.shortTime;
            } catch (e) {
              this.apiError = this.errorHandlerService.handleError(e);
            }
          }
        }
      }
      this.totals = this.tripOrdersData
        .reduce((res: any, tod) => {
          this.addressInvalid = this.addressInvalid || !this.isValidZipcode(tod.zipcode);
          if (tod.totals) {
            res.type = OrderType.Trip;
            res.tvq += tod.totals.tvq;
            res.tps += tod.totals.tps;
            res.totalAmount += tod.totals.totalAmount;
            res.extras.baseFare += tod.totals.extras.baseFare;
            res.extras.distanceFare += tod.totals.extras.distanceFare;
            res.extras.surgeTime = !!tod.totals.extras.surgeTime;
          }
          return res;
        }, {
          tvq: 0,
          tps: 0,
          totalAmount: 0,
          extras: {
            baseFare: 0,
            distanceFare: 0,
            surgeTime: false,
          },
        });
    }
  }

  dateChanged({detail: {value}}) {
    this.shortDate = value.substring(0, 10);
    const date = this.getSelectDateTime();
    const now = this.getNow(!this.shortTime);
    if (now.getTime() > date.getTime()) {
      this.dateInvalid = true;
    } else {
      this.dateInvalid = !this.validate7Days(date);
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

  private isValidZipcode(zipcode: string) {
    return this.availableZipcodes.indexOf(zipcode) > -1;
  }

  private async calcPricesForOrder(data: OrderPrepareRequestData) {
    const preparedOrder = await this.ordersService
      .prepareOrder(data)
      .toPromise() as OrderPrepareDataWithExtras;
    return preparedOrder;
  }

  private runSaveOrder(order: OrderV2, idx: number, tripUuid: string): Observable<any> {
    const timeout = 1000 * idx;
    const subj = new Subject<any>();
    order.metadata.tripUuid = tripUuid;
    setTimeout(async () => {
      await this.ordersService
        .create(order)
        .toPromise();
      subj.next(true);
      subj.complete();
    }, timeout);
    return subj;
  }

  private initData() {
    this.ordersService
      .getMinTripOrdersCount()
      .subscribe(count => {
        this.minTripOrders = count;
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
        this.tripOrders = Array.from(Array(this.minTripOrders), () => new OrderV2({ type: OrderType.Trip }));
        this.tripOrdersData = Array.from(Array(this.minTripOrders), () => new TripOrderData());
      });
  }

  private validate7Days(date: Date) {
    const date7 = new Date();
    date7.setDate(date7.getDate() + 7);
    return date7.getTime() > date.getTime();
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
    let googleAddress = null;
    if (this.googlePlaceAddress) {
      googleAddress = this.googlePlaceAddress;
    } else {
      const tripOrderData = this.tripOrdersData
        .find(tod => !tod.addressInvalid && tod.googlePlaceAddress);
      if (tripOrderData) {
        googleAddress = tripOrderData.googlePlaceAddress;
      }
    }
    if (googleAddress) {
      // Selected location timezone
      date = new Date(this.getFormatDateString(dateStr, 0, googleAddress));
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
  private getFormatDateString(dateStr, additionalOffset = 0, googleAddress?): string {
    return dateStr + this.getTimezoneOffsetString(additionalOffset, false, googleAddress);
  }

  private getTimezoneOffsetString(additionalOffset = 0, inverse = false,  googleAddress) {
    googleAddress = googleAddress || this.googlePlaceAddress;
    const timeOffset = (googleAddress as any).utc_offset_minutes + additionalOffset;
    const hoursOffset = Math.abs(Math.floor(timeOffset / 60));
    const minutesOffset = Math.abs(timeOffset % 60);
    if (!inverse) {
      return (timeOffset >= 0 ? '+' : '-') + this.leadWithZero(hoursOffset) + ':' + this.leadWithZero(minutesOffset);
    } else {
      return (timeOffset < 0 ? '+' : '-') + this.leadWithZero(hoursOffset) + ':' + this.leadWithZero(minutesOffset);
    }
  }

  private leadWithZero(num) {
    return ('0' + num).slice(-2);
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
        type: this.orderType,
        startTime: startDate,
        endTime: endDate,
        address: this.formatted_address,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    return !!data;
  }

  private getPreparePriceRequestData(address?: Address) {
    address = address || this.googlePlaceAddress;
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
      origin: {
        lat: this.merchant.departments[0].latitude,
        lon: this.merchant.departments[0].longitude,
      },
      destination: {
        lat: address.geometry.location.toJSON().lat,
        lon: address.geometry.location.toJSON().lng,
      },
      type: this.orderType,
      discount: 0,
      largeOrder: this.orderType === OrderType.Booking ? this.largeOrder : false,
      bringBack: this.orderType === OrderType.Booking ? this.bringBack : false,
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
    this.order.metadata.largeOrder = this.largeOrder;
    this.order.metadata.bringBack = this.bringBack;
    this.order.metadata.bringBackOnUnavailable = this.bringBackOnUnavailable;
    this.order.metadata.utcOffset = (this.googlePlaceAddress as any).utc_offset_minutes;
  }

  private applyFormDataToTripOrders() {
    this.tripOrdersData
      .forEach((tod, idx) => {
        const order = this.tripOrders[idx];
        order.scheduledAt = this.getFormatDateString(`${this.shortDate}T${this.shortTime}`, 0, tod.googlePlaceAddress);
        order.metadata.description = '';
        order.metadata.pickUpLat = this.merchant.departments[0].latitude;
        order.metadata.pickUpLon = this.merchant.departments[0].longitude;
        order.metadata.pickUpTitle = this.merchant.name;
        order.metadata.pickUpAddress = this.merchant.departments[0].address;
        order.metadata.pickUpPhone = this.merchant.phone;
        order.metadata.pickUpEmail = this.merchant.email;
        order.metadata.dropOffLat = tod.googlePlaceAddress.geometry.location.toJSON().lat;
        order.metadata.dropOffLon = tod.googlePlaceAddress.geometry.location.toJSON().lng;
        order.metadata.dropOffTitle = tod.name;
        order.metadata.dropOffAddress = tod.formattedAddress;
        order.metadata.dropOffPhone = tod.phone;
        order.metadata.utcOffset = (tod.googlePlaceAddress as any).utc_offset_minutes;
      });
  }
}
