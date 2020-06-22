import { MenuOption } from './menu-option';
import { Entity } from './entity';
import { MerchantV2 } from './merchant-v2';

export class MenuSubOption extends Entity {
  option: MenuOption;
  optionId: number;
  merchant: MerchantV2;
  merchantId: number;
  title: string;
  price: number;
  enabled = true;

  categoryName?: string;

  constructor(data?: Partial<MenuSubOption>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
