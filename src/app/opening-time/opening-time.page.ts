import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../shared/user.service';
import { NgForm } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { HelperService } from '../shared/helper.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-opening-time',
  templateUrl: './opening-time.page.html',
  styleUrls: ['./opening-time.page.scss'],
})
export class OpeningTimePage implements OnInit {

  invalid = false;

  @ViewChild('form') form: NgForm;

  closeHour: string;
  openHour: string;

  get OpenHour() {
    return this.openHour ? +this.openHour.split(':')[0] : 10;
  }
  get CloseHour() {
    return this.closeHour ? +this.closeHour.split(':')[0] : 22;
  }

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private apiSerivce: ApiService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.openHour = this.userService.user.openhour ? this.userService.user.openhour + ':00' : '10:00';
    this.closeHour = this.userService.user.closehour ? this.userService.user.closehour + ':00' : '22:00';
  }

  timeChanged() {
    if (this.OpenHour >= this.CloseHour) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
  }

  updateOpeningTime() {
    this.http
      .get(
        this.apiSerivce.getUrl(`/marchands/updatehours/${this.userService.user.id}/${this.OpenHour}/${this.CloseHour}`),
      )
      .subscribe(
        (resp) => {
          this.updateUserTime();
          this.showSuccess();
        },
        err => {
          if (err.statusText !== 'OK') {
            this.showError();
          } else {
            this.updateUserTime();
            this.showSuccess();
          }
        }
      );
  }

  private updateUserTime() {
    this.userService
      .updateUserData({
        openhour: this.OpenHour.toString(),
        closehour: this.CloseHour.toString(),
      });
  }

  private showError() {
    this.helper.showError('Problems with changing Opening Time. Please, try later or contact us');
  }

  private showSuccess() {
    this.helper.showToast('Opening Time has been changed successfully');
  }

}
