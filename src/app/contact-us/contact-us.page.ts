import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MerchantsService } from '../shared/merchants.service';
import { HelperService } from '../shared/helper.service';
import { ErrorHandlerService } from '../shared/error-handler.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  @ViewChild('form', { static: true }) form: NgForm;

  invalid = false;

  name: string;
  email: string;
  subject = '0';
  message = '';

  subjects = [
    {
      value: 1,
      title: 'General Customer Service'
    }, {
      value: 2,
      title: 'Suggestions'
    }, {
      value: 3,
      title: 'Product Support'
    }
  ];

  constructor(
    private merchantsService: MerchantsService,
    private helperService: HelperService,
    private errorHandlerService: ErrorHandlerService,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.form.reset();
    this.merchantsService
      .$merchant
      .subscribe(merchant => {
        this.name = merchant.name;
        this.email = merchant.email;
      });
  }

  sendEmail() {
    if (this.message.length < 5) {
      this.invalid = true;
    } else {
      this.invalid = false;
      const data = {
        name: this.name,
        email: this.email,
        message: this.message,
      };
      this.merchantsService
        .contactUs(data)
        .subscribe(() => {
          this.helperService.showToast('Email has been sent');
        }, e => {
          this.helperService.showToast(
            this.errorHandlerService.handleError(e),
          );
        });
    }
  }

}
