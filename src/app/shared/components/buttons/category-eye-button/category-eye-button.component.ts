import { Component, Input, OnInit } from '@angular/core';
import { CategoriesV2Service } from '../../../categories-v2.service';
import { MenuCategory } from '../../../menu-category';

@Component({
  selector: 'app-category-eye-button',
  templateUrl: './category-eye-button.component.html',
  styleUrls: ['./category-eye-button.component.scss'],
})
export class CategoryEyeButtonComponent implements OnInit {

  @Input() category: MenuCategory;

  constructor(
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {
  }

  toggle() {
    const category = new MenuCategory({
      id: this.category.id,
      isPublished: !this.category.isPublished,
    });
    this.categoriesV2Service
      .update(category)
      .subscribe(
        () => {
          this.category.isPublished = !this.category.isPublished;
          this.categoriesV2Service.loadCategories();
        }
      );
  }

}
