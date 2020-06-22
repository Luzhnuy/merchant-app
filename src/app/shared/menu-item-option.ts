import { MenuItem } from './menu-item';
import { MenuOption } from './menu-option';
import { Merchant } from './merchant';
import { Entity } from './entity';

export class MenuItemOption extends Entity {
  merchant: Merchant;
  merchantId: number;
  item: MenuItem;
  itemId: number;
  option: MenuOption;
  optionId: number;
  count: number;

  constructor(data: Partial<MenuItemOption>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
