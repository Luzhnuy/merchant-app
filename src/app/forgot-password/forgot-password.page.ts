import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { HelperService } from '../shared/helper.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email = '';

  constructor(
    private userService: UserService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
  }

  restorePassword() {
    this.userService
      .restorePassword(this.email)
      .subscribe(res => {
        if (res) {
          this.helper.showToast('Please check you email to get your password');
        } else {
          this.helper.showError('Problems with restoring password. Please, try later or contact us');
        }
      });
  }

}
