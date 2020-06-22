import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelperService } from '../../../helper.service';
import { MenuCategory } from '../../../menu-category';
import { CategoriesV2Service } from '../../../categories-v2.service';
import { MerchantsService } from '../../../merchants.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
})
export class CategoryModalComponent implements OnInit {

  @Input() accountId: number;
  @Input() data: MenuCategory;

  name = '';
  description = '';
  isPublished = true;

  constructor(
    private modalController: ModalController,
    private categoriesService: CategoriesV2Service,
    private merchantsService: MerchantsService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.name = this.data.name;
      this.description = this.data.description;
      this.isPublished = this.data.isPublished;
    }
  }

  submit() {
    const category = new MenuCategory({
      id: this.data ? this.data.id : undefined,
      name: this.name,
      description: this.description,
      merchantId: this.accountId,
      isPublished: this.isPublished,
    });
    if (category.id) {
      this.categoriesService
        .update(category)
        .subscribe(
          () => {
            this.modalController.dismiss();
            this.helper.showToast('Category was saved successfully');
            this.loadCategories();
          }
        );
    } else {
      this.categoriesService
        .create(category)
        .subscribe(
          () => {
            this.modalController.dismiss();
            this.helper.showToast('Category was saved successfully');
            this.loadCategories();
          }
        );
    }
  }

  loadCategories() {
    this.categoriesService
      .loadCategories();
    // this.categoriesService
    //   .getAll()
    //   .subscribe(categories => this.data = categories);
  }

  cancel() {
    this.modalController.dismiss();
  }

}
