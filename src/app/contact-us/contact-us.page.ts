import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ApiService } from '../shared/api.service';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  @ViewChild('form') form: NgForm;

  invalid = false;

  name: string;
  email: string;
  subject = '0';
  message = '';

  subjects = [
    {
      value: 1,
      title: 'General Customer Service'
    }, {
      value: 2,
      title: 'Suggestions'
    }, {
      value: 3,
      title: 'Product Support'
    }
  ];

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private apiService: ApiService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.form.reset();
    this.name = this.userService.user.name;
    this.email = this.userService.user.username;
  }

  sendEmail() {
    if (this.message.length < 5) {
      this.invalid = true;
    } else {
      this.invalid = false;
      const showMessage = () => {
        this.message = ' ';
        this.subject = '0';
        this.toastController.create({
            message: 'Email sent! Thanks',
            duration: 2000,
            color: 'success',
            position: 'top',
          })
          .then(t => {
            t.present();
          });
      };
      const payload = new FormData();

      payload.append('name', this.name);
      payload.append('email', this.email);
      payload.append('message', this.message);

      this.http
        .post(
          this.apiService.getUrl('marchands/email'),
          payload
        )
        .subscribe(
          () => {
            showMessage();
          },
          err => {
            if (err.statusText === 'OK') {
              showMessage();
            }
          });
    }
  }

}
