import { Component, EventEmitter, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UserServiceV2 } from './shared/user-v2.service';
import { HelperService } from './shared/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from './shared/orders.service';
import { MerchantsService } from './shared/merchants.service';
import { OrderStatus, OrderType, OrderV2 } from './shared/order-v2';
import { OneSignalService } from './shared/one-signal.service';
import { environment } from '../environments/environment';
import { pipe } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  curOrder: OrderV2;
  isLogged: boolean;
  allOrders: OrderV2[] = [];
  orders: OrderV2[] = [];
  greenScreenOrders = 0;
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
    private helperService: HelperService,
    private oneSignalService: OneSignalService,
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.ordersService
      .newExternalOrder$
      .subscribe(() => {
        this.showGreenScreen();
      });
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
                  .subscribe(orders => {
                    this.allOrders = orders;
                  });
              }
            });
        }
      });
  }

  private async showGreenScreen() {
    if (this.greenScreenOrders) {
      this.greenScreenOrders++;
    } else {
      this.greenScreenOrders = 1;
    }
  }

  hideGreenScreen() {
    const element = window.document
      .getElementsByClassName('green-screen')[0];
    element.style.opacity = 0;
    setTimeout(() => {
      this.greenScreenOrders = 0;
      element.style.opacity = 1;
    }, 320);
  }

  filterChange($event) {
    this.orders = $event;
  }

  initializeApp() {
    const logged = new EventEmitter();
    this.platform.ready().then(() => {
      this.userService
        .$user
        .pipe(takeUntil(logged))
        .subscribe(user => {
          if (user && user.isLogged()) {
            logged.emit();
            this.oneSignalService.init(
              environment.oneSignal.appId,
              environment.oneSignal.googleProjectNumber,
              environment.oneSignal.safariWebId,
            );
            if (!this.oneSignalService.subscribed) {
              this.oneSignalService
                .subscribe(user.id);
            }
            this.oneSignalService
              .$eventsOpenedThread
              .subscribe(event => {
                if (event.notification.isAppInFocus === false) {
                  if (event.notification.payload.additionalData.type === 'OrderStatusChanged') {
                    this.router.navigate(['/order', event.notification.payload.additionalData.orderId]);
                  }
                }
              });
          }
        });
      if (this.platform.is('ios')) {
        this.statusBar.styleDefault();
      } else {
        this.statusBar.styleBlackOpaque();
      }
      this.splashScreen.hide();
    });
  }
}
