import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { UserService } from '../shared/user.service';
import { HelperService } from '../shared/helper.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  @ViewChild('form') form: NgForm;

  newpass: string;
  newpass2: string;

  constructor(
    private http: HttpClient,
    private apiSerivce: ApiService,
    private userService: UserService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.form.reset();
  }

  changePassword() {
    this.http
      .post(
        this.apiSerivce.getUrl('/users/apichangepassword/'),
        {
          password: this.newpass,
          cfpassword: this.newpass2,
          id: this.userService.user.id,
        },
      )
      .subscribe(
        (resp) => {
          this.showSuccess();
        },
        err => {
          if (err.statusText !== 'OK') {
            this.showError();
          } else {
            this.showSuccess();
          }
        }
      );
  }

  private showError() {
    this.helper.showError('Problems with changing password. Please, try later or contact us');
  }

  private showSuccess() {
    this.helper.showToast('Password has been changed successfully');
  }

}
