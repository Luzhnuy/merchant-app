import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ProductModalComponent } from '../../shared/components/modals/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';
import { MenuItem } from '../../shared/menu-item';
import { MerchantsService } from '../../shared/merchants.service';
import { MerchantV2 } from '../../shared/merchant-v2';
import { MenuCategory } from '../../shared/menu-category';
import { CategoriesV2Service } from '../../shared/categories-v2.service';
import { takeUntil } from 'rxjs/operators';
import {ItemsV2Service} from "../../shared/items-v2.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy {

  merchant: MerchantV2;
  items: MenuItem[];
  categories: MenuCategory[];

  $destroyed = new EventEmitter<any>();

  limit = 25;
  page = 0;
  query = '';
  oldQuery = '';
  isLoading = true;

  totalPagesCount = 0;
  pageButtonsCount = 0;
  curStartIdx = 0;
  pageNumbers: number[];

  constructor(
    private modalController: ModalController,
    private merchantsService: MerchantsService,
    private categoriesService: CategoriesV2Service,
    private itemsV2Service: ItemsV2Service,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.merchantsService
      .$merchant
      .pipe(takeUntil(this.$destroyed))
      .subscribe(merchant => {
        this.merchant = merchant;
      });
    this.route
      .queryParams
      .pipe(takeUntil(this.$destroyed))
      .subscribe(async (params) => {
        params = Object.assign({
          limit: this.limit,
          page: this.page,
          query: this.query,
        }, params);
        this.limit = params.limit;
        this.page = parseInt(params.page.toString(), 10);
        this.query = params.query;
        if (this.oldQuery !== this.query || this.totalPagesCount === 0) {
          if (this.query) {
            this.totalPagesCount = 0;
          } else {
            await this.initTotalCount();
          }
        }
        this.oldQuery = this.query;
        if (this.query) {
          await this.doSearch();
        } else {
          await this.loadMenuItems();
        }
        this.initPager();
      });
  }

  async ngOnDestroy() {
    this.$destroyed.emit();
  }

  async showProductModal(item: MenuItem = null) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: {
        accountId: this.merchant.id,
        data: item,
      }
    });
    await modal.present();
  }

  async loadMenuItems() {
    const params = {
      limit: this.limit,
      offset: this.page * this.limit,
      query: this.query,
    };
    this.isLoading = true;
    try {
      this.items = await this.itemsV2Service
        .getAll(params)
        .toPromise();
    } finally {
      this.isLoading = true;
    }
  }

  clearSearch() {
    if (this.query) {
      this.query = '';
      this.page = 0;
    }
    this.navigate();
  }

  searchChanged() {
    this.page = 0;
    this.navigate();
  }

  nextPage() {
    this.page++;
    this.navigate();
  }

  prevPage() {
    this.page > 0 && this.page--;
    this.navigate();
  }

  setPage(page) {
    this.page = page;
    this.navigate();
  }

  async doSearch() {
    if (this.query) {
      if (this.query.length >= 3) {
        try {
          this.isLoading = true;
          this.items = await this.itemsV2Service
            // this.searchItems = await this.itemsService
            .getAll(
              this.getQueryParams(),
              // {
              //   query: this.searchQuery,
              //   merchantId: this.merchant.id,
              // }
            )
            .toPromise();
        } finally {
          this.isLoading = false;
        }
      } else {
        this.items = [];
      }
    } else {
      this.clearSearch();
    }
  }

  private getQueryParams() {
    return {
      limit: this.limit,
      page: this.page,
      query: this.query,
    }
  }

  private navigate() {
    this.router.navigate([this.router.routerState.snapshot.url.split('?')[0]], {
      queryParams: this.getQueryParams(),
    });
  }

  private async initTotalCount() {
    const totalCount = await this.itemsV2Service
      .total()
      .toPromise();
    this.totalPagesCount = Math.ceil(totalCount / this.limit);
  }

  private initPager() {
    const page = parseInt(this.page.toString(), 10);
    if (this.totalPagesCount) {
      this.pageButtonsCount = Math.min(this.totalPagesCount, 11);
      const leftRight = Math.floor(this.pageButtonsCount / 2);
      if (page < leftRight) {
        this.curStartIdx = 0;
      } else if (this.totalPagesCount - page - 1 < leftRight) {
        this.curStartIdx = this.totalPagesCount - this.pageButtonsCount;
      } else {
        this.curStartIdx = page - leftRight;
      }
      this.pageNumbers = (new Array(this.pageButtonsCount)).fill(null).map((_, i) => this.curStartIdx + i);
    }
  }
}
