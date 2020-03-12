import { Component, OnInit } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { UserServiceV2 } from '../shared/user-v2.service';

@Component({
  selector: 'app-confirm-sms-phone',
  templateUrl: './confirm-sms-phone.page.html',
  styleUrls: ['./confirm-sms-phone.page.scss'],
})
export class ConfirmSmsPhonePage implements OnInit {

  email: string;
  code: string;

  constructor(
    private userService: UserServiceV2,
    private helper: HelperService,
    private activatedRoute: ActivatedRoute,
    private errorHandler: ErrorHandlerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.activatedRoute
      .queryParams
      .subscribe(params => this.email = params.email);
  }

  confirm() {
    this.userService
      .confirmSms(this.email, this.code)
      .subscribe(res => {
        this.router.navigate(['/']);
      }, err => {
        this.helper.showError(this.errorHandler.handleError(err));
      });
  }

  resendSms() {
    this.userService
      .resendSms(this.email)
      .subscribe(res => {
        this.helper.showToast('New SMS with secret code has been sent.');
      }, err => {
        this.helper.showError(this.errorHandler.handleError(err));
      });
  }

}
