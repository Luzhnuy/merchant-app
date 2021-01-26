import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MerchantV2 } from '../../shared/merchant-v2';
import { MenuCategory } from '../../shared/menu-category';
import { MerchantsService } from '../../shared/merchants.service';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { takeUntil } from 'rxjs/operators';
import {ItemsV2Service} from "../../shared/items-v2.service";

@Component({
  selector: 'app-all',
  templateUrl: './all.page.html',
  styleUrls: ['./all.page.scss'],
})
export class AllPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  categories: MenuCategory[];

  searchQuery = '';
  isSearching = false;
  searchCategory = new MenuCategory();
  showAll = true;
  showLoading = true;
  loadingPartly: boolean;
  allItemsLoaded = false;
  maxItemsToLoadCount = 25;

  destroyed$ = new EventEmitter<any>();

  constructor(
    private merchantsService: MerchantsService,
    private categoriesV2Service: CategoriesV2Service,
    private itemsV2Service: ItemsV2Service,
  ) { }

  ngOnInit() {
    this.merchantsService
      .$merchant
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchant => {
        this.merchant = merchant;
        this.loadMenu();
      });
  }

  async ngOnDestroy() {
    this.destroyed$.emit();
  }

  loadMore() {
    this.loadMenuItemsPartly();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchCategory.items = [];
    this.doSearch();
  }

  async doSearch() {
    this.showLoading = true;
    if (this.searchQuery) {
      this.isSearching = true;
      this.showAll = false;
      if (this.searchQuery.length >= 3) {
        try {
          this.searchCategory.name = `Search results for "${ this.searchQuery }":`;
          this.searchCategory.items = await this.itemsV2Service
            // this.searchItems = await this.itemsService
            .getAll({
              query: this.searchQuery,
              merchantId: this.merchant.id,
            })
            .toPromise();
        } finally {
        }
      } else {
        this.searchCategory.items = [];
        // this.searchItems = [];
      }
    } else {
      this.isSearching = false;
      this.showAll = true;
    }
    this.showLoading = false;
  }

  private loadMenu() {
    this.categoriesV2Service
        .getAllLite({
          merchantId: this.merchant.id,
          loadEmpty: true,
        })
        .pipe(takeUntil(this.destroyed$))
        .subscribe(categories => {
              this.categories = categories;
              this.loadMenuItemsPartly();
            }, err => {
              console.log(err);
            },
        );
  }

  private async loadMenuItemsPartly() {
    this.showLoading = true;
    this.loadingPartly = true;
    let categoryIds: number[] = [];
    let itemsToLoadCount = 0;
    const categoriesAssoc: { [key: number]: MenuCategory } = {};

    for (const category of this.categories) {
      category.items = category.items || [];
      const itemsCountLeft = category.itemsCount - category.items.length;
      if (itemsCountLeft === 0) {
        continue;
      }
      if (category.itemsCount >= this.maxItemsToLoadCount) {
        if (itemsToLoadCount) {
          await this.loadCategoriesMenuItems(categoryIds, itemsToLoadCount, categoriesAssoc);
          itemsToLoadCount = 0;
        }
        await this.loadCategoryMenuItems(category);
        if (itemsCountLeft >= this.maxItemsToLoadCount) {
          break;
        }
      } else {
        itemsToLoadCount += category.itemsCount;
        categoryIds.push(category.id);
        categoriesAssoc[category.id] = category;
        if (itemsToLoadCount >= this.maxItemsToLoadCount) {
          await this.loadCategoriesMenuItems(categoryIds, itemsToLoadCount, categoriesAssoc);
          itemsToLoadCount = 0;
          break;
        }
      }
    }
    if (itemsToLoadCount) {
      await this.loadCategoriesMenuItems(categoryIds, itemsToLoadCount, categoriesAssoc);
    }
    let loadedItemsCount = 0;
    let totalItemsToLoadCount = 0;
    this.categories
        .forEach(category => {
          totalItemsToLoadCount += category.itemsCount;
          if (category.items) {
            loadedItemsCount += category.items.length;
          }
        });
    this.allItemsLoaded = loadedItemsCount === totalItemsToLoadCount;
    this.loadingPartly = false;
    this.showLoading = false;
  }

  private async loadCategoryMenuItems(category: MenuCategory, limit?: number) {
    if (!limit) {
      const loadedCount = category.items.length;
      const leftCount = category.itemsCount - loadedCount;
      limit = Math.min(leftCount, this.maxItemsToLoadCount);
    }
    const menuItems = await this.itemsV2Service
        .getAll({ categoryId: category.id, limit, offset: category.items.length })
        .toPromise();
    menuItems.forEach(menuItem => {
      category.items.push(menuItem);
    });
  }

  private async loadCategoriesMenuItems(categoryIds: number[], limit: number, categoriesAssoc) {
    const menuItems = await this.itemsV2Service
        .getAll({ categoryId: categoryIds, limit })
        .toPromise();
    menuItems.forEach(menuItem => {
      const category = categoriesAssoc[menuItem.categoryId];
      category.items.push(menuItem);
    });
  }

}
