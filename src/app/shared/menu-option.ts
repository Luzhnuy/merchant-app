import { Merchant } from './merchant';
import { MenuItemOption } from './menu-item-option';
import { MenuSubOption } from './menu-sub-option';
import { Entity } from './entity';

export class MenuOption extends Entity {
  merchant: Merchant;
  merchantId: number;
  items: MenuItemOption[];
  subOptions: MenuSubOption[];
  title: string;
  enabled = true;

  constructor(data?: Partial<MenuOption>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
