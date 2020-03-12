import { Driver } from './driver';

export class DriverStatus {

  id: number;
  isOnline: boolean;
  latitude: number;
  longitude: number;

  constructor(init?: Partial<Driver>) {
    if (init) {
      Object.assign(this, init);
    }
  }

}
