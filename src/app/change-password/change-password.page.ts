import { Component, OnInit, ViewChild } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { NgForm } from '@angular/forms';
import { ApiV2Service } from '../shared/api-v2.service';
import { UserServiceV2 } from '../shared/user-v2.service';
import { UserV2 } from '../shared/user-v2';
import { ErrorHandlerService } from '../shared/error-handler.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  @ViewChild('form', { static: true }) form: NgForm;

  curPassword: string;
  newPassword: string;
  newpass2: string;

  private user: UserV2;

  constructor(
    private apiService: ApiV2Service,
    private userService: UserServiceV2,
    private helper: HelperService,
    private errorHandler: ErrorHandlerService,
  ) { }

  ngOnInit() {
    this.userService
      .$user
      .subscribe(user => this.user = user);
  }

  ionViewWillEnter() {
    this.form.reset();
  }

  changePassword() {
    this.userService
      .changePassword(this.user.id, this.curPassword, this.newPassword)
      .subscribe(() => this.showSuccess(), e => this.showError(e));
  }

  private showError(e) {
    const message = this.errorHandler.handleError(e);
    this.helper.showError(message);
  }

  private showSuccess() {
    this.helper.showToast('Password has been changed successfully');
  }

}
