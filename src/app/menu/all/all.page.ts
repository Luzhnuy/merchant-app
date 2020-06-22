import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ProductModalComponent } from '../../shared/components/modals/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';
import { CategoryModalComponent } from '../../shared/components/modals/category-modal/category-modal.component';
import { MerchantV2 } from '../../shared/merchant-v2';
import { MenuCategory } from '../../shared/menu-category';
import { MerchantsService } from '../../shared/merchants.service';
import { MenuItem } from '../../shared/menu-item';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-all',
  templateUrl: './all.page.html',
  styleUrls: ['./all.page.scss'],
})
export class AllPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  categories: MenuCategory[];

  $destroyed = new EventEmitter<any>();

  constructor(
    private modalController: ModalController,
    private merchantsService: MerchantsService,
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {
    this.categoriesV2Service
      .$categories
      .pipe(takeUntil(this.$destroyed))
      .subscribe(categories => this.categories = categories);
    this.merchantsService
      .$merchant
      .pipe(takeUntil(this.$destroyed))
      .subscribe(merchant => {
        this.merchant = merchant;
        // this.categories = this.merchant.categories;
      });
  }

  async ngOnDestroy() {
    this.$destroyed.emit();
  }

  async showProductModal(data: MenuItem = null) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId: this.merchant.id,
        data
      }
    });
    return await modal.present();
  }

  async showCategoryModal(data: MenuCategory = null) {
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: {
        accountId: this.merchant.id,
        data
      }
    });
    return await modal.present();
  }

}
