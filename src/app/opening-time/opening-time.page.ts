import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { MerchantsService } from '../shared/merchants.service';
import { MerchantV2 } from '../shared/merchant-v2';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-opening-time',
  templateUrl: './opening-time.page.html',
  styleUrls: ['./opening-time.page.scss'],
})
export class OpeningTimePage implements OnInit {

  invalid = false;

  @ViewChild('form', { static: true }) form: NgForm;

  closeHour: string;
  openHour: string;
  merchant: MerchantV2;

  get OpenHour() {
    return this.openHour ? +this.openHour.split(':')[0] : 10;
  }
  get CloseHour() {
    return this.closeHour ? +this.closeHour.split(':')[0] : 22;
  }

  constructor(
    private http: HttpClient,
    private merchantsService: MerchantsService,
    private helper: HelperService,
    private errorHandler: ErrorHandlerService,
  ) { }

  ngOnInit() {
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
  }

  timeChanged() {
    if (this.OpenHour >= this.CloseHour) {
      this.invalid = true;
    } else {
      this.invalid = false;
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

  private showError(e) {
    const message = this.errorHandler.handleError(e);
    this.helper.showError(message);
  }

  private showSuccess() {
    this.helper.showToast('Opening Time has been changed successfully');
  }

}
