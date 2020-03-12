import { DriverStatus } from './driver-status';
import { Entity } from './entity';
import { UserV2 } from './user-v2';
import { OrderStatus, OrderV2 } from './order-v2';

export enum DriverType {
  Car = 'Car',
  Bicycle = 'Bicycle',
}

export class Driver extends Entity {

  id: number;
  user: UserV2 = new UserV2();
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: DriverType = DriverType.Car;
  maxSimultaneousDelivery = 0;
  isPublished = true;
  status: DriverStatus;
  activeJobsCount = 0;
  activeJobs: OrderV2[] = [];

  getMaxOrderStatus() {
    if (this.activeJobs.find(order => order.status === OrderStatus.OnWay)) {
      return OrderStatus.OnWay;
    }
    if (this.activeJobs.find(order => order.status === OrderStatus.Accepted)) {
      return OrderStatus.Accepted;
    }
  }

  get isDefault() {
    return this.user.isDefault;
  }

  get FullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(init?: Partial<Driver>) {
    super();
    if (init) {
      if (init.user) {
        this.user = new UserV2(init.user);
        this.user = null;
        delete this.user;
      }
      Object.assign(this, init);
    }
  }
}
