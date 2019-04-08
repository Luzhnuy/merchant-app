import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { HelperService } from '../shared/helper.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  firstname: string;
  lastname: string;
  email: string;
  password: string;

  constructor(
    private userService: UserService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
  }

  register() {
    this.userService
      .createUser(this.firstname, this.lastname, this.email, this.password)
      .subscribe(res => {
        if (res) {
          this.helper.showToast('User has been created. Please contact us to activate account.');
        } else {
          this.helper.showError('It looks like this email exists. Please, try another email or contact us');
        }
      });
    // alert('Not implemented yet. Please use Login for now');
  }
}
