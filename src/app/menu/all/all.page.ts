import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../shared/menu.service';
import { UserService } from '../../shared/user.service';
import { Product } from '../../shared/product';
import { ProductModalComponent } from '../../shared/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';
import { Category } from '../../shared/category';
import { CategoryModalComponent } from '../../shared/category-modal/category-modal.component';

@Component({
  selector: 'app-all',
  templateUrl: './all.page.html',
  styleUrls: ['./all.page.scss'],
})
export class AllPage implements OnInit {

  constructor(
    public userService: UserService,
    public menuService: MenuService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  async showProductModal(accountId: string, data: Product = null) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId,
        data
      }
    });
    return await modal.present();
  }

  async showCategoryModal(accountId: string, data: Category = null) {
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: {
        accountId,
        data
      }
    });
    return await modal.present();
  }

}
