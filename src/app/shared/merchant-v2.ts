import { MerchantDepartment } from './merchant-department';
import { MenuCategory } from './menu-category';
import { Entity } from './entity';
import { UserV2 } from './user-v2';

export class MerchantV2 extends Entity {
  name: string;
  tagline: string;
  description: string;
  keywords: string;
  website: string;
  phone: string;
  email: string;
  logo: string;
  departments: MerchantDepartment[] = [];
  user: UserV2 = new UserV2();
  userId: number;
  enableBooking = true;
  enableMenu = false;
  menuActive = false;
  subscribedOnReceipt: boolean;
  categories: MenuCategory[] = [];
  // bringBack: boolean;
  ageVerification: boolean;

  constructor(data?: Partial<MerchantV2>, strict = false) {
    super();
    if (data) {
      if (strict) {
        delete this.enableBooking;
        delete this.enableMenu;
        delete this.categories;
        delete this.departments;
        delete this.user;
      }
      Object.assign(this, data);
    }
    if (!strict) {
      if (!this.departments || this.departments.length === 0) {
        const dep = new MerchantDepartment();
        dep.merchantId = this.id;
        this.departments = [ dep ];
      }
    }
  }
}
