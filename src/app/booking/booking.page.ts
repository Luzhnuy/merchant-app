import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { UserService } from '../shared/user.service';
import { Booking } from '../shared/booking';
import { BookingService } from '../shared/booking.service';
import { isSuccess } from '@angular/http/src/http_utils';
import { OrdersHistoryService } from '../shared/orders-history.service';
import { NgForm } from '@angular/forms';
import { BookingExtra } from '../shared/booking-extra';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {

  @ViewChild('form') form: NgForm

  name: string;
  address: string;
  zipcode: string;
  fee: string;
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
    'H4C', 'H1Y', 'H1V', 'H1W', 'H1X', 'H3C', 'H4B', 'H2K', 'H3P', 'H4V', 'H3R', 'H2S', 'H3K', 'H3S', 'H3X', 'H3Y', 'H4G', 'H4A', 'H4E',
    'H3W',
  ];

  private zipcodeszone1 = ['J4H', 'J4G', 'J4R', 'J4S', 'J4W', 'J4X', 'J4P', 'H2N', 'H2P', 'H2R',
    'H1A', 'H1B', 'H1C', 'H1E', 'H1G', 'H1H', 'H1J', 'H1K', 'H1M', 'H1L', 'H1N', 'H1P', 'H1R',
    'H1S', 'H1T', 'H1Z', 'H2A', 'H2B', 'H2C', 'H2E', 'H2M',
    'H3E', 'H3L', 'H3M', 'H3N', 'H4H', 'H4J', 'H4K', 'H4L', 'H4M', 'H4N', 'H4P', 'H4R',
    'H4S', 'H4T', 'H4W', 'H4X', 'H4Y',
    'H8N', 'H8P', 'H8R', 'H8S', 'H8T', 'H8Y', 'H8Z', 'H9A', 'H9B', 'H9C', 'H9E', 'H9G', 'H9H',
    'H9J', 'H9K', 'H9P', 'H9R', 'H9S', 'H9W', 'H9X'
  ];

  private initialFee = 0;

  constructor(
    public alertController: AlertController,
    private http: HttpClient,
    private apiSerivce: ApiService,
    private userService: UserService,
    private bookingService: BookingService,
    private toastController: ToastController,
    private ordersService: OrdersHistoryService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initData();
  }

  createOrder() {

    // Check time, because it can be in the past
    this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});

    if (this.timeInvalid || this.dateInvalid) {
      return;
    }

    const data = {
      customerFee: this.fee,
      deliveryInstructions: `Booking Form Instruction: ${this.instruction}`,
      dropoffDetail: {
        address: this.formatted_address,
        description: '',
        email: '',
        name: this.name,
        phone: this.phone,
        zipcode: this.zipcode,
      },
      pickupDetail: { // from user
        address: this.userService.user.address,
        description: '',
        email: this.userService.user.username,
        name: this.userService.user.name,
        phone: this.userService.user.phone,
      },
      pickupTime: this.getFormatDateString(`${this.shortDate}T${this.shortTime}`, 60),
      reference: this.userService.user.token,
    };
    const extra: BookingExtra = {
      distance: this.distance,
      largeorder: this.largeOrder ? 1 : 0,
      bringback: this.bringBack ? 1 : 0,
    };
    const booking = new Booking(data);
    this.bookingService
      .book(booking, extra)
      .subscribe(sucess => {
        if (sucess) {
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
          this.ordersService.startLoadingCurrentOrders();
        } else {
          this.showAlert(
            'Oops, There seems to be an issue placing delivery. Please contact us at <a href="tel:438-927-7627">438-927-7627</a>',
            'Error'
          );
        }
      }, err => {
        this.showAlert(
          'Oops, There seems to be an issue placing delivery. Please contact us at <a href="tel:438-927-7627">438-927-7627</a>',
          'Error'
        );
      });
  }

  handleAddressChange($event) {
    this.addressInvalid = false;
    const longZipcode = $event.address_components.find(cmp => {
      return cmp.types.indexOf('postal_code') > -1;
    });
    const shortZipcode = longZipcode ? longZipcode.long_name.substring(0, 3) : '';
    this.zipcode = shortZipcode;
    this.formatted_address = $event.formatted_address;
    this.googlePlaceAddress = $event;

    if (this.zipcodeszone.indexOf(shortZipcode) > -1) {
      this.initialFee = 12.99;
      this.calculateTotalFee();
    } else if (this.zipcodeszone1.indexOf(shortZipcode) > -1) {
      this.http
        .get(this.apiSerivce.getUrl('marchands/getdistancePhp7Comp/'
          + this.userService.user.address
          + '/'
          + $event.formatted_address
        ))
        .subscribe((resp: any) => {
          if (resp.status === 'OK' && resp.rows.length > 0) {
            const dist = resp.rows[0].elements[0].distance.value / 1000;
            this.distance = dist.toFixed(2);
            const fee = 9 + (dist * 0.90);
            if (fee <= 25.99) {
              this.initialFee = parseFloat(fee.toFixed(2));
            } else {
              this.initialFee = 25.99;
            }
          } else {
            this.initialFee = 0;
            this.showAlert('Problems with calculating distance. Please try another address', 'Error');
          }
          this.calculateTotalFee();
        }, err => {
          this.initialFee = 0;
          this.calculateTotalFee();
          this.showAlert('Problems with calculating distance. Please try another address', 'Error');
        });
    } else {
      this.addressInvalid = true;
    }

    this.timeChanged({detail: {value: this.shortTime.substring(0, 5)}});
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

  timeChanged({detail: {value}}) {
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
    if (timeHM.h >= minH && timeHM.h <= maxH) {
      this.timeInvalid = false;
    } else {
      this.timeInvalid = true;
    }

    if (!this.timeInvalid && this.date) {
      const date = this.getSelectDateTime();
      const now = this.getNow();
      if (now.getTime() >= date.getTime()) {
        this.dateInvalid = true;
      } else {
        this.dateInvalid = false;
      }
    }
  }

  calculateTotalFee() {
    let fee = this.initialFee;
    if (this.bringBack) {
      fee += this.initialFee * .55;
    }
    if (this.largeOrder) {
      fee += this.initialFee * .1;
    }
    this.fee = fee.toFixed(2);
  }

  private initData() {
    this.form.reset();

    this.name = '';
    this.address = '';
    this.zipcode = '';
    this.initialFee = 0;
    this.fee = '';
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

  private getUTCDateString(dateStr) {
    const d = new Date(dateStr);
    return d.getUTCFullYear() + '-'
      + this.leadWithZero(d.getUTCMonth() + 1) + '-'
      + this.leadWithZero(d.getUTCDate()) + ' '
      + this.leadWithZero(d.getUTCHours()) + ':'
      + this.leadWithZero(d.getUTCMinutes()) + ':00'
      + '+00:00';
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
    dateStr += this.getTimezoneOffsetString(additionalOffset, true);
    const d = new Date(dateStr);
    const formattedDate = d.getFullYear() + '-'
      + this.leadWithZero(d.getMonth() + 1) + '-'
      + this.leadWithZero(d.getDate()) + ' '
      + this.leadWithZero(d.getHours()) + ':'
      + this.leadWithZero(d.getMinutes()) + ':00'
      + this.getTimezoneOffsetString(additionalOffset);
    return formattedDate;
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

  async showAlert(message, title) {
    const alert = await this.alertController.create({
      header: title,
      // subHeader: 'Subtitle',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}

