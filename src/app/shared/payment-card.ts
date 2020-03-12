import { Entity } from './entity';

export class PaymentCard extends Entity {
  stripeId: string;
  source: string;
  brand: string;
  last4: string;

  constructor(data?: Partial<PaymentCard>) {
    super();
    this.isPublished = true;
    if (data) {
      Object.assign(this, data);
    }
  }
}
