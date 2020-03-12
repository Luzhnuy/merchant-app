import { MenuItem } from './menu-item';
import { Entity } from './entity';
import { MerchantV2 } from './merchant-v2';

export class MenuCategory extends Entity {
  items: MenuItem[];
  merchant: MerchantV2;
  merchantId: number;
  name: string;
  description: string;

  constructor(data?: Partial<MenuCategory>, strict = false) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
