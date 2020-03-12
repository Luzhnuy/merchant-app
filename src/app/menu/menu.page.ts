import { Component, OnInit } from '@angular/core';
import { CategoriesV2Service } from '../shared/categories-v2.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  constructor(
    private categoriesV2Service: CategoriesV2Service,
  ) { }

  ngOnInit() {
    this.categoriesV2Service.loadCategories();
  }

}
