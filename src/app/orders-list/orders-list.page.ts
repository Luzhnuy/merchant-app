import { Component, EventEmitter, OnInit } from '@angular/core';
import { OrdersSearchParams, OrdersService } from '../shared/orders.service';
import { OrderV2 } from '../shared/order-v2';
import { HelperService } from '../shared/helper.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.page.html',
  styleUrls: ['./orders-list.page.scss'],
})
export class OrdersListPage implements OnInit {

  orders: OrderV2[] = [];

  private params: OrdersSearchParams = new OrdersSearchParams();

  leave$ = new EventEmitter();

  constructor(
    private helper: HelperService,
    private ordersService: OrdersService
  ) { }

  ngOnInit() {

  }

  ionViewDidLeave() {
    this.leave$.emit();
  }

  async ionViewDidEnter() {
    await this.helper.showLoading();
    this.ordersService
      .getAll()
      .pipe( takeUntil(this.leave$) )
      .subscribe(orders => {
        this.orders = orders;
        this.helper.stopLoading();
      }, error => {
        this.helper.stopLoading();
      });
  }

}
