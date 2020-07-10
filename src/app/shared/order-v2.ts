import { Entity } from './entity';
import { OrderMetadata } from './order-metadata';
import { DeliveryToOptions, OrderDeliveredTo } from './order-delivered-to';
import { OrderItem } from './order-item';
import { environment } from '../../environments/environment';
import { Driver } from './driver';
import { MerchantV2 } from './merchant-v2';

export enum OrderStatus {
  Cancelled = 'Cancelled',
  OnWay = 'OnWay',
  Accepted = 'Accepted',
  Completed = 'Completed',
  Received = 'Received',
}

export enum OrderSource {
  Customer = 'Customer',
  Merchant = 'Merchant',
  Manual = 'Manual',
}

export enum OrderType {
  Custom = 'Custom',
  Menu = 'Menu',
  Booking = 'Booking',
  Trip = 'Trip',
}

export class OrderV2 extends Entity {

  uuid: string;
  metadata: OrderMetadata = new OrderMetadata();
  driverProfile?: Driver;
  customerId: number;
  status: OrderStatus;
  source: OrderSource = OrderSource.Merchant;
  type: OrderType = OrderType.Booking;
  scheduledAt: Date | string = new Date();
  acceptedAt: Date = null;
  get AcceptedAtStr() {
    return this.acceptedAt ? this.acceptedAt.toString() : null;
  }
  onWayAt: Date = null;
  completedAt: Date = null;
  cancelledAt: Date = null;

  deliveredTo: OrderDeliveredTo;
  orderItems?: OrderItem[];
  utcOffset: number;

  driverProfileId: number;
  merchant: MerchantV2;
  merchantId: number = null;

  isNew = false;

  get ReceiptImage() {
    return `${environment.apiUrlV2}${this.metadata.driverPhoto}`;
  }

  get DeliveredTo() {
    let toRet = '---';
    if (this.deliveredTo) {
      switch (this.deliveredTo.option) {
        case DeliveryToOptions.Address:
          toRet = 'Recipient';
          break;
        default:
          toRet = `${this.deliveredTo.option}:`
            + (this.deliveredTo.name ? ` ${this.deliveredTo.name} ` : '')
            + (this.deliveredTo.phone ? `(${this.deliveredTo.phone})` : '')
            + (this.deliveredTo.address ? ` ${this.deliveredTo.address}` : '');
          break;
      }
    }
    return toRet;
  }

  constructor(init?: Partial<OrderV2>) {
    super();
    if (init && init.metadata) {
      init.metadata = new OrderMetadata(init.metadata);
    }
    if (init) {
      Object.assign(this, init);
    }
    if (typeof this.createdAt === 'string') {
      this.createdAt = new Date(this.createdAt);
    }
    if (typeof this.acceptedAt === 'string') {
      this.acceptedAt = new Date(this.acceptedAt);
    }
    if (typeof this.onWayAt === 'string') {
      this.onWayAt = new Date(this.onWayAt);
    }
    // if (!this.scheduledAt) {
    //   this.scheduledAt = new Date();
    // }
  }
}
