import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../product';
import { ProductsService } from '../../products.service';
import { MenuService } from '../../menu.service';
import { HelperService } from '../../helper.service';

@Component({
  selector: 'app-category-eye-button',
  templateUrl: './category-eye-button.component.html',
  styleUrls: ['./category-eye-button.component.scss'],
})
export class CategoryEyeButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() products: Product[];

  disabled = false;

  constructor(
    private productsService: ProductsService,
    private menuService: MenuService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    this.disabled = this.products
      .reduce((res, product) => {
        return res && product.disabled === '1';
      }, true);
  }

  toggle() {
    let requestCount = 0;
    let requestFinishedCount = 0;
    this.products
      .forEach(product => {
        const trueValue = this.disabled ? '0' : '1';
        if (product.disabled !== trueValue) {
          requestCount++;
          this.productsService
            .saveProduct(
              this.accountId,
              new Product({
                id: product.id,
                nameeng: product.nameeng,
                shortdescriptioneng: product.shortdescriptioneng,
                price: product.price,
                category: product.category,
                disabled: trueValue,
              })
            )
            .subscribe(res => {
              requestFinishedCount++
              if (res) {
                if (requestFinishedCount === requestCount) {
                  this.menuService.loadMenu();
                }
              } else {
                this.helper.showError('Problems with saving product. Please, try later or contact us');
              }
            });
        }
      });
  }

}
