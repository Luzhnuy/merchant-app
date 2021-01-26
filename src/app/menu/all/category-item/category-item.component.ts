import {Component, Input, OnInit} from '@angular/core';
import {MenuCategory} from "../../../shared/menu-category";
import {MenuItem} from "../../../shared/menu-item";
import {ProductModalComponent} from "../../../shared/components/modals/product-modal/product-modal.component";
import {CategoryModalComponent} from "../../../shared/components/modals/category-modal/category-modal.component";
import {MerchantV2} from "../../../shared/merchant-v2";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent implements OnInit {

  @Input() merchant: MerchantV2;
  @Input() category: MenuCategory;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

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
