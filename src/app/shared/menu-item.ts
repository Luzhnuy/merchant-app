import { MenuCategory } from './menu-category';
import { MerchantV2 } from './merchant-v2';
import { Entity } from './entity';
import { MenuItemOption } from './menu-item-option';

export class MenuItem extends Entity {
  category: MenuCategory;
  categoryId: number;
  merchant: MerchantV2;
  merchantId: number;
  options: MenuItemOption[];
  name: string;
  description: string;
  price: number;
  image: string;
  isWaiting: boolean;
  categoryName?: string;

  constructor(data?: Partial<MenuItem>, strict = false) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
