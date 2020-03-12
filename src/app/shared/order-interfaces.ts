import { OrderType } from './order-v2';

export interface OrderPreparePriceData {
  // chargeId?: number;
  // chargeId2?: number;
  tvq?: number;
  tps?: number;
  tip?: number;
  tipPercent?: number;
  customAmount?: number;
  totalAmount?: number;
  // chargedAmount?: number;
  discount?: number;
  deliveryCharge?: number;
  subtotal?: number;
  serviceFee?: number;
}

export interface OrderPrepareDistanceData {
  distance?: number;
}

export interface OrderPrepareData extends OrderPrepareDistanceData, OrderPreparePriceData {
  type: OrderType;
  largeOrder?: boolean;
  bringBack?: boolean;
}

export interface OrderPrepareRequestData extends OrderPrepareData {
  origin: string | { lat: number, lon: number };
  destination: string | { lat: number, lon: number };
  scheduledTime?: number; // minutes
}
