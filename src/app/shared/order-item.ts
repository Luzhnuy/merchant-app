import { MenuItem } from './menu-item';
import { MenuSubOption } from './menu-sub-option';

export class OrderItem {
  quantity = 0;
  description = '';
  price?: number;
  sku?: string;
  name?: string;
  comment?: string;
  menuItem?: MenuItem;
  menuItemId?: number;
  orderId?: number;
  subOptions: MenuSubOption[];
  subOptionIds: number[];
}
