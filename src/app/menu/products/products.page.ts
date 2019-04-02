import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../shared/menu.service';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../shared/product';
import { UserService } from '../../shared/user.service';
import { ProductModalComponent } from '../../shared/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  products$ = new BehaviorSubject<Product[]>([]);

  constructor(
    public menuService: MenuService,
    public userService: UserService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.menuService
      .menus$
      .subscribe(
        menus => this.products$.next(menus.reduce((res, menu) => [...res, ...menu.products], []))
      );
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

}
