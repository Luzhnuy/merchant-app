import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserServiceV2 } from '../shared/user-v2.service';

declare var fbq: (...args) => void;
declare var lintrk: (...args) => void;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';

  constructor(
    private userService: UserServiceV2,
    private toastController: ToastController,
    private router: Router,
  ) { }

  ngOnInit() {
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
    if (typeof lintrk === 'function') {
      lintrk('track');
    }
  }

  login() {
    this.userService
      .login(this.email, this.password)
      .subscribe(() => {
          this.router.navigate(['/']);
        },
          err => {
        this.toastController
          .create({
            message: 'Invalid email or password! Please try again',
            duration: 5000,
            color: 'danger',
            position: 'top',
          })
          .then(t => {
            t.present();
          });
      });
  }

}
