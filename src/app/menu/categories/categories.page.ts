import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../shared/menu.service';
import { UserService } from '../../shared/user.service';
import { ModalController } from '@ionic/angular';
import { Category } from '../../shared/category';
import { CategoryModalComponent } from '../../shared/category-modal/category-modal.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  constructor(
    public menuService: MenuService,
    public userService: UserService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
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
