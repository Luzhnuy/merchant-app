import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from '../../menu.service';
import { ProductsService } from '../../products.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-product-delete-button',
  templateUrl: './product-delete-button.component.html',
  styleUrls: ['./product-delete-button.component.scss'],
})
export class ProductDeleteButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() productId: string;

  constructor(
    private productsService: ProductsService,
    private menuService: MenuService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {}

  async onDelete() {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete product?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Yes',
          handler: () => {
            this.productsService
              .deleteProduct(this.accountId, this.productId)
              .subscribe(() => {
                this.menuService.loadMenu();
              });
          }
        }
      ]
    });
    await alert.present();
  }

}
