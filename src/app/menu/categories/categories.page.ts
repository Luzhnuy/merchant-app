import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryModalComponent } from '../../shared/category-modal/category-modal.component';
import { MerchantsService } from '../../shared/merchants.service';
import { MenuCategory } from '../../shared/menu-category';
import { MerchantV2 } from '../../shared/merchant-v2';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  categories: MenuCategory[];

  $destroyed = new EventEmitter<any>();

  constructor(
    private modalController: ModalController,
    private merchantsService: MerchantsService,
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  async ngOnInit() {
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
