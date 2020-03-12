import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../shared/orders.service';
import { OrderV2 } from '../shared/order-v2';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.page.html',
  styleUrls: ['./orders-list.page.scss'],
})
export class OrdersListPage implements OnInit {

  public orders: OrderV2[] = [];

  constructor(
    public ordersService: OrdersService,
  ) { }

  ngOnInit() {
    this.ordersService
      .getAll()
      .subscribe(orders => this.orders = orders);
  }

  onOrderClick(order: OrderV2) {
    this.ordersService.setCurrentOrder(order);
  }

}
