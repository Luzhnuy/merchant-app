import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OrderV2 } from './shared/order-v2';
import { UserServiceV2 } from './shared/user-v2.service';
import { HelperService } from './shared/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from './shared/orders.service';
import { MerchantsService } from './shared/merchants.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  curOrder: OrderV2;
  isLogged = false;
  orders: OrderV2[] = [];

  private authUrls = ['/login', '/forgot-password', '/sign-up', '/confirm-sms-phone'];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userService: UserServiceV2,
    private helper: HelperService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ordersService: OrdersService,
    private merchantsService: MerchantsService,
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.ordersService
      .$currentOrder
      .subscribe(order => {
        this.curOrder = order;
      });
    this.userService
      .$user
      .subscribe(user => {
        if (!user || !user.isLogged()) {
          this.isLogged = false;
        } else {
          this.isLogged = true;
          this.merchantsService
            .$merchant
            .subscribe(merchant => {
              if (merchant) {
                this.ordersService
                  .startWatch();
                this.ordersService
                  .getAll()
                  .subscribe(orders => this.orders = orders);
              }
            });
        }
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  setCurrentOrder(order: OrderV2) {
    this.ordersService.setCurrentOrder(order);
  }

  logout() {
    this.userService
      .logout()
      .subscribe(() => {
        window.location.reload();
      });
  }
  // constructor(
  //   private platform: Platform,
  //   private splashScreen: SplashScreen,
  //   private statusBar: StatusBar
  // ) {
  //   this.initializeApp();
  // }
  //
  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     this.statusBar.styleDefault();
  //     this.splashScreen.hide();
  //   });
  // }
}
