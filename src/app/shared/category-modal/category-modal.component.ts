import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Category } from '../category';
import { CategoriesService } from '../categories.service';
import { MenuService } from '../menu.service';
import { HelperService } from '../helper.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
})
export class CategoryModalComponent implements OnInit {

  @Input() accountId: string;
  @Input() data: Category;

  name = '';
  description = '';

  constructor(
    private modalController: ModalController,
    private menuService: MenuService,
    private categoriesService: CategoriesService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.name = this.data.nameeng;
      this.description = this.data.shortdescriptioneng;
    }
  }

  submit() {
    this.categoriesService
      .saveCategory(
        this.accountId,
        new Category({
          id: this.data ? this.data.id : null,
          nameeng: this.name,
          shortdescriptioneng: this.description,
        })
      )
      .subscribe(res => {
        if (res) {
          this.helper.showToast('Category was saved successfully');
          this.menuService.loadMenu();
        } else {
          this.helper.showError('Problems with saving category. Please, try later or contact us');
        }
        this.modalController.dismiss();
      });
  }

  cancel() {
    this.modalController.dismiss();
  }

}
