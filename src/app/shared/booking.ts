export class Booking {
  customerFee: string;
  deliveryInstructions: string;
  dropoffDetail: {
    address: string;
    description: string;
    email: string;
    name: string;
    phone: string;
    zipcode: string;
  };
  pickupDetail: { // from user
    address: string;
    description: string;
    email: string;
    name: string;
    phone: string;
  };
  pickupTime: string; // time in input
  reference: string;

  public constructor(init: Required<Booking>) {
    Object.assign(this, init);
  }
}
