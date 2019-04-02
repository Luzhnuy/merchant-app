import { Category } from './category';
import { Product } from './product';

export class Menu {
  private _category: Category;
  private _products: Product[];

  get category(): Category {
    return this._category;
  }

  get products(): Product[] {
    return this._products;
  }

  constructor(category: Required<Category>, products: Required<Product>[]) {
    this._category = new Category(category);
    this._products = products.map(data => new Product(data));
  }
}
