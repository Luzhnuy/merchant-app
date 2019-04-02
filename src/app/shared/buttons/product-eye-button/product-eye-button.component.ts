import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../product';
import { ProductsService } from '../../products.service';
import { MenuService } from '../../menu.service';
import { HelperService } from '../../helper.service';

@Component({
  selector: 'app-product-eye-button',
  templateUrl: './product-eye-button.component.html',
  styleUrls: ['./product-eye-button.component.scss'],
})
export class ProductEyeButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() product: Product;

  constructor(
    private productsService: ProductsService,
    private menuService: MenuService,
    private helper: HelperService,
  ) { }

  ngOnInit() {}

  toggle() {
    this.productsService
      .saveProduct(
        this.accountId,
        new Product({
          id: this.product.id,
          nameeng: this.product.nameeng,
          shortdescriptioneng: this.product.shortdescriptioneng,
          price: this.product.price,
          category: this.product.category,
          disabled: this.product.disabled === '1' ? '0' : '1',
        })
      )
      .subscribe(res => {
        if (res) {
          this.menuService.loadMenu();
        } else {
          this.helper.showError('Problems with saving product. Please, try later or contact us');
        }
      });
  }

}
