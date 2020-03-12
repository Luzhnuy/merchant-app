import { Component, OnInit } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { UserServiceV2 } from '../shared/user-v2.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email = '';

  constructor(
    private userService: UserServiceV2,
    private helper: HelperService,
  ) { }

  ngOnInit() {
  }

  restorePassword() {
    this.userService
      .resetPassword(this.email)
      .subscribe(res => {
        if (res) {
          this.helper.showToast('Please check you email to get your password');
        } else {
          this.helper.showError('Problems with restoring password. Please, try later or contact us');
        }
      });
  }

}
