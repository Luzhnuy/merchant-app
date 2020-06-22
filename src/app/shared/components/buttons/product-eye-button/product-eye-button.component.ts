import { Component, Input, OnInit } from '@angular/core';
import { ItemsV2Service } from '../../../items-v2.service';
import { MenuItem } from '../../../menu-item';
import { CategoriesV2Service } from '../../../categories-v2.service';

@Component({
  selector: 'app-product-eye-button',
  templateUrl: './product-eye-button.component.html',
  styleUrls: ['./product-eye-button.component.scss'],
})
export class ProductEyeButtonComponent implements OnInit {

  @Input() item: MenuItem;

  constructor(
    private itemsV2Service: ItemsV2Service,
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {
  }

  toggle() {
    const item = new MenuItem({
      id: this.item.id,
      isPublished: !this.item.isPublished,
    }, true);
    this.itemsV2Service
      .update(item)
      .subscribe(() => {
        this.item.isPublished = !this.item.isPublished;
        this.categoriesV2Service.loadCategories();
      });
  }
}
