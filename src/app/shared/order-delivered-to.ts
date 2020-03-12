import { Entity } from './entity';
import { OrderV2 } from './order-v2';

export enum DeliveryToOptions {
  Address = 'Address',
  Neighbour = 'Neighbour',
  Reception = 'Reception',
  Other = 'Other',
}

export class OrderDeliveredTo extends Entity {

  order: OrderV2;
  option: DeliveryToOptions;
  name: string;
  address: string;
  phone: string;

  constructor(init?: Partial<OrderDeliveredTo>) {
    super();
    if (init) {
      Object.assign(this, init);
    }
  }
}
