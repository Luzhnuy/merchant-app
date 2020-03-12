export class PaymentCardCredentials {
  name: string;
  number: number;
  month: string;
  year: string;
  cvc: string;
  object: 'card' = 'card';
  userId?: number;

  constructor(data?: Partial<PaymentCardCredentials>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
