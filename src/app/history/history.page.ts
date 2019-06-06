import { Component, OnInit } from '@angular/core';
import { OrdersHistoryService } from '../shared/orders-history.service';
import { Order } from '../shared/order';
import { HelperService } from '../shared/helper.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  expandedOrderId: string | null;

  history: Order[] = [];

  constructor(
    private ordersHistoryService: OrdersHistoryService,
    private helper: HelperService,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.helper.showLoading();
    this.loadHistory();
  }

  toggleOrderDetails(orderId: string) {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
    }
  }

  private loadHistory() {

    this.ordersHistoryService.loadHistory()
      .subscribe(
        (orders) => {
          this.ordersHistoryService.mergeOrders(this.history, orders);
          setTimeout(() => {
            this.helper.stopLoading();
          }, 100);
        }, err => {
          console.log('Error');
          this.helper.stopLoading();
        }
      );
  }

}
