export class Order {
  trackingUrls: {
    api: string;
    www: string;
  };
  reference: string;
  pickupTime: any;
  pickupLocation: {
    address: string;
    name: string;
    phone: string;
  };
  lastUpdated: string;
  id: string;
  estimatedDistance: {
    kilometres: number;
  };
  dropoffLocation: {
    address: string;
    name: string;
    phone: string;
  };
  created: string;
  currentStatus: 'Accepted' | 'Received' | 'Cancelled' | 'PickedUp' | 'Completed';
  deliveryFee: number;
  deliveryInstructions: string | number;
  driver: {
    name: string;
  };
  items: {
    description: string;
    price: number;
    quantity: number;
    sku: string; // product id
  }[];

  public constructor(init: Partial<Order>) {
    Object.assign(this, init);
  }
}
