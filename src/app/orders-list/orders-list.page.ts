import { Component, OnInit } from '@angular/core';
import { OrdersHistoryService } from '../shared/orders-history.service';
import { Order } from '../shared/order';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.page.html',
  styleUrls: ['./orders-list.page.scss'],
})
export class OrdersListPage implements OnInit {

  constructor(
    public ordersService: OrdersHistoryService,
  ) { }

  ngOnInit() {
  }

  onOrderClick(order: Order) {
    this.ordersService.setCurrentOrder(order);
  }

}
