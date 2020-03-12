import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CategoriesV2Service } from '../../categories-v2.service';
import { MerchantsService } from '../../merchants.service';

@Component({
  selector: 'app-category-delete-button',
  templateUrl: './category-delete-button.component.html',
  styleUrls: ['./category-delete-button.component.scss'],
})
export class CategoryDeleteButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() categoryId: number;

  constructor(
    private alertController: AlertController,
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {}

  async onDelete() {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete category?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Yes',
          handler: () => {
            this.categoriesV2Service
              .remove(this.categoryId)
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
