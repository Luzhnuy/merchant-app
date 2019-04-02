import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Order } from './shared/order';
import { OrdersHistoryService } from './shared/orders-history.service';
import { UserService } from './shared/user.service';
import { Router } from '@angular/router';
import { HelperService } from './shared/helper.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  curOrder: Order;

  isLogged = false;

  private authUrls = ['/login', '/forgot-password', '/sign-up'];

  constructor(
    public ordersService: OrdersHistoryService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userService: UserService,
    private helper: HelperService,
    private router: Router,
  ) {
    this.initializeApp();
  }
  ngOnInit() {

    this.ordersService
      .currentOrder
      .subscribe(order => this.curOrder = order);

    this.userService
      .user$
      .subscribe(user => {
        if (user === null) {
          this.isLogged = false;
          this.ordersService.stopLoadingCurrentOrders();
        } else {
          this.isLogged = true;
          this.helper.showLoading();
          this.ordersService.startLoadingCurrentOrders();
          if (this.authUrls.indexOf(this.router.routerState.snapshot.url) > -1) {
            this.router.navigate(['/booking']);
          }
        }
      });

    this.ordersService
      .orders
      .subscribe(() => {
        setTimeout(
          () => {
            this.helper.stopLoading();
          }, 100);
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  setCurrentOrder(order: Order) {
    this.ordersService.setCurrentOrder(order);
  }

  logout() {
    this.userService.logout();
  }
}
