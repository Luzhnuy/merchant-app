import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Product } from '../product';
import { MenuService } from '../menu.service';
import { Category } from '../category';
import { ProductsService } from '../products.service';
import { HelperService } from '../helper.service';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() accountId: string;
  @Input() data: Product;

  name = '';
  description = '';
  price = '';
  category = '';
  disabled = false;

  categories: Category[];

  constructor(
    private modalController: ModalController,
    private menuService: MenuService,
    private productsService: ProductsService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.name = this.data.nameeng || '';
      this.description = this.data.shortdescriptioneng || '';
      this.price = this.data.price || '';
      this.category = this.data.category || '';
      this.disabled = this.data.disabled === '1';
    }
    this.categories = this.menuService.menus.map(menu => menu.category);
  }

  submit() {
    this.productsService
      .saveProduct(
        this.accountId,
        new Product({
          id: this.data ? this.data.id : null,
          nameeng: this.name,
          shortdescriptioneng: this.description,
          price: this.price,
          category: this.category,
          disabled: this.disabled ? '1' : '0',
        })
      )
      .subscribe(res => {
        if (res) {
          this.helper.showToast('Product was saved successfully');
          this.menuService.loadMenu();
        } else {
          this.helper.showError('Problems with saving product. Please, try later or contact us');
        }
        this.modalController.dismiss();
      });
  }

  cancel() {
    this.modalController.dismiss();
  }

}
