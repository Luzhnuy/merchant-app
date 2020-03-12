import { Component, OnInit } from '@angular/core';
import { Order } from '../shared/order';
import { HelperService } from '../shared/helper.service';
import { OrdersSearchParams, OrdersService } from '../shared/orders.service';
import { OrderV2 } from '../shared/order-v2';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  expandedOrderId: number | null;
  orders: OrderV2[] = [];

  private params: OrdersSearchParams = new OrdersSearchParams();

  constructor(
    private helper: HelperService,
    private ordersService: OrdersService
  ) { }

  ngOnInit() {}

  async ionViewDidEnter() {
    await this.helper.showLoading();
    try {
      this.orders = await this.ordersService.loadHistory();
    } finally {
      await this.helper.stopLoading();
    }
  }

  async sendReceipt(order: OrderV2) {
    try {
      await this.ordersService
        .sendEmail(order)
        .toPromise();
      this.helper.showToast('Receipt sent');
    } catch (e) {
      this.helper.showError('There was something wrong, receipt not sent');
    }
  }

  toggleOrderDetails(orderId: number) {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
    }
  }
}
