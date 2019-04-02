import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email = '';

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
  }

  // TODO implement method
  restorePassword() {
    alert('Not implemented yet. Please use Login for now');
    // this.userService
    //   .restorePassword(this.email);
    // alert('restorePassword');
    // Success Please check you email to get your password
  }

}
