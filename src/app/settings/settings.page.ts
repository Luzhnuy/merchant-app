import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(
    public userService: UserService,
    private http: HttpClient,
    private apiService: ApiService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
  }

}
