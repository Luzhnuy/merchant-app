import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ItemsV2Service } from '../../items-v2.service';
import { CategoriesV2Service } from '../../categories-v2.service';

@Component({
  selector: 'app-product-delete-button',
  templateUrl: './product-delete-button.component.html',
  styleUrls: ['./product-delete-button.component.scss'],
})
export class ProductDeleteButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() productId: string;

  constructor(
    private alertController: AlertController,
    private itemsService: ItemsV2Service,
    private categoriesV2Service: CategoriesV2Service,
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
            this.itemsService
              .remove(this.productId)
              .subscribe(() => {
                this.categoriesV2Service.loadCategories();
              });
          }
        }
      ]
    });
    await alert.present();
  }

}
