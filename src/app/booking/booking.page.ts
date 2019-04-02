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
  date: string;
  time: string;
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
      pickupTime: this.getShortDate(this.date) + ` ${this.time}`, // time in input
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

    if (this.zipcodeszone.indexOf(shortZipcode) > -1) {
      debugger;
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

            debugger;

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
  }

  dateChanged({detail: {value}}) {
    const dateStr = value + ' ' + (this.time || '00:00');
    const date = new Date(dateStr);
    const now = this.getNow(!this.time);
    if (now.getTime() > date.getTime()) {
      this.dateInvalid = true;
    } else {
      this.dateInvalid = false;
    }
  }

  timeChanged({detail: {value}}) {
    const timeCmps = value.split(':').map(v => +v);
    const timeHM = {
      h: timeCmps[0],
      m: timeCmps[1],
    };
    const minH = 10;
    let maxH = 22;
    if (timeHM.m) {
      maxH = 21;
    }
    if (timeHM.h >= minH && timeHM.h <= maxH) {
      this.timeInvalid = false;
    } else {
      this.timeInvalid = true;
    }

    if (!this.timeInvalid && this.date) {
      const date = new Date(`${this.date} ${this.time}`);
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
    this.time = ('0' + (now.getHours() + 1)).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    this.date = curYear + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    this.minYear = curYear;
    this.maxYear = curYear + 1;
  }

  private getShortDate(dateStr) {
    const date = new Date(dateStr);
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  }

  private getNow(clearTime = false) {
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

