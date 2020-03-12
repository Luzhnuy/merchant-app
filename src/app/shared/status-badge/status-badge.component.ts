import { Component, Input, OnInit } from '@angular/core';
import { OrderStatus } from '../order-v2';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent implements OnInit {

  // @Input() status: 'Accepted' | 'Received' | 'Cancelled' | 'PickedUp' | 'Completed';

  @Input() status: OrderStatus;

  orderStatuses = OrderStatus;

  constructor() { }

  ngOnInit() {}

}
