import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ProductModalComponent } from '../../shared/components/modals/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';
import { MenuItem } from '../../shared/menu-item';
import { MerchantsService } from '../../shared/merchants.service';
import { MerchantV2 } from '../../shared/merchant-v2';
import { MenuCategory } from '../../shared/menu-category';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  items: MenuItem[];
  categories: MenuCategory[];

  $destroyed = new EventEmitter<any>();

  constructor(
    private modalController: ModalController,
    private merchantsService: MerchantsService,
    private categoriesService: CategoriesV2Service,
  ) { }

  async ngOnInit() {
    this.categoriesService
      .$categories
      .pipe(takeUntil(this.$destroyed))
      .subscribe(categories => {
        this.items = categories.reduce( (res, cat) => {
          return res.concat(cat.items);
        }, []);
      });
    this.merchantsService
      .$merchant
      .pipe(takeUntil(this.$destroyed))
      .subscribe(merchant => {
        this.merchant = merchant;
      });
  }

  async ngOnDestroy() {
    this.$destroyed.emit();
  }

  async showProductModal(item: MenuItem = null) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId: this.merchant.id,
        data: item,
      }
    });
    await modal.present();
  }

}
