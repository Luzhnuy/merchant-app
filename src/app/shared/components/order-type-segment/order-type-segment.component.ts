import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { OrderType, OrderV2 } from '../../order-v2';

@Component({
  selector: 'app-order-type-segment',
  templateUrl: './order-type-segment.component.html',
  styleUrls: ['./order-type-segment.component.scss'],
})
export class OrderTypeSegmentComponent implements OnInit, OnChanges {

  @Input() allOrders: OrderV2[] = [];
  @Input() totalCount: number;
  @Output() orders = new EventEmitter<OrderV2[]>();
  orderTypesValues: Array<OrderType | OrderType[]> = [
    OrderType.Menu,
    [ OrderType.Booking, OrderType.Trip ],
  ];
  selectedTypes: OrderType | OrderType[] = this.orderTypesValues[0];
  OrderType = OrderType;

  ordersByTypes: Array<OrderV2[]> = [[], []];

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    this.filterOrders();
    this.emitOrders();
  }

  orderTypeChange($event) {
    this.selectedTypes = $event.detail.value;
    this.emitOrders();
  }

  private filterOrders() {
    const types1 = [ this.orderTypesValues[0] ];
    const types2 = this.orderTypesValues[1];
    this.ordersByTypes = this.allOrders.reduce((res: Array<OrderV2[]>, order) => {
      if (types1.indexOf(order.type) > -1) {
        res[0].push(order);
      }
      if (types2.indexOf(order.type) > -1) {
        res[1].push(order);
      }
      return res;
    }, [[], []]);
  }

  private emitOrders() {
    this.orders.emit(
      this.ordersByTypes[
        this.orderTypesValues.indexOf(this.selectedTypes)
      ]);
  }

}
