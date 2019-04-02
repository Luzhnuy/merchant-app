import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';

  constructor(
    private userService: UserService,
    private toastController: ToastController,
    private router: Router,
  ) { }

  ngOnInit() {
    const subscr = this.userService
      .user$
      .subscribe(user => {
        if (user) {
          this.router.navigate(['/booking']);
        }
        // timeout is used, because service is sync now. It won't be necessary when user service will be async
        setTimeout(() => {
          subscr.unsubscribe();
        }, 100);
      });
  }

  login() {
    this.userService
      .login(this.email, this.password)
      .subscribe(res => {
        if (!res) {
          this.toastController.create({
            message: 'Invalid email or password! Please try again',
            duration: 5000,
            color: 'danger',
            position: 'top',
          })
            .then(t => {
              t.present();
            });
        }
      });
  }

}
