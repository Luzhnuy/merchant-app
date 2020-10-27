export class OrderMetadata {

  id: number;

  distance: number;
  description: string;
  largeOrder: boolean;
  bringBack: boolean;
  bringBackOnUnavailable: boolean;
  deliveryCharge: number;
  subtotal: number;
  taxes: number;
  discount: number;
  tip: string;
  tipPercent: string | number;
  customAmount: number;
  totalAmount: number;
  reference: string;
  pickUpAddress: string;
  dropOffAddress: string;
  pickUpLat: number;
  pickUpLon: number;
  dropOffLat: number;
  dropOffLon: number;
  dropOffTitle: string;
  dropOffPhone: string;
  dropOffEmail: string;
  pickUpTitle: string;
  pickUpPhone: string;
  pickUpEmail: string;
  chargeId: string;
  lastFour: string;
  deliveryInstructions: string;
  customerPhoto: string;
  driverPhoto: string;
  chargedAmount: number;
  cancellationReason: string;
  utcOffset: number;

  tps?: number;
  tvq?: number;
  serviceFee?: number;

  tripUuid: string;

  constructor(init?: Partial<OrderMetadata>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
