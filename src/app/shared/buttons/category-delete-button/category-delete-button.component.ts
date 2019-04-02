import { Component, Input, OnInit } from '@angular/core';
import { CategoriesService } from '../../categories.service';
import { MenuService } from '../../menu.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-category-delete-button',
  templateUrl: './category-delete-button.component.html',
  styleUrls: ['./category-delete-button.component.scss'],
})
export class CategoryDeleteButtonComponent implements OnInit {

  @Input() accountId: string;
  @Input() categoryId: string;

  constructor(
    private categoriesService: CategoriesService,
    private menuService: MenuService,
    private alertController: AlertController,
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
            this.categoriesService
              .deleteCategory(this.accountId, this.categoryId)
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
