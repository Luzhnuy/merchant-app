import {Injectable} from '@angular/core';
import {EntitiesService} from './entities.service';
import {ApiV2Service} from './api-v2.service';
import {MenuCategory} from './menu-category';
import {HelperService} from './helper.service';
import {ErrorHandlerService} from './error-handler.service';
import {environment} from '../../environments/environment';
import {Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {MerchantV2} from './merchant-v2';

@Injectable({
  providedIn: 'root'
})
export class CategoriesV2Service extends EntitiesService<MenuCategory> {

  protected readonly endpoint = 'menu-categories';

  private readonly $$categories = new ReplaySubject<MenuCategory[]>(1);
  public readonly $categories: Observable<MenuCategory[]> = this.$$categories.asObservable();

  private $subscription: Subscription;
  private isWatching = false;

  constructor(
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
    protected readonly apiClient: ApiV2Service,
  ) {
    super(helper, errorHandler);
  }

  async loadCategories() {
    const categories = await this.getAll().toPromise();
    this.$$categories.next(categories);
  }

  getAll(params?) {
    const subj = new Subject<MenuCategory[]>();
    this.apiClient.get(
      `${this.endpoint}`,
      params,
    )
      .subscribe(
        (data: MenuCategory[]) => {
          data = data.map(cat => {
            cat.items = cat.items
              .map(item => {
                item.categoryName = cat.name;
                if (item.image) {
                  item.image = environment.imageHost + item.image;
                }
                return item;
              });
            return cat;
          });
          subj.next(data);
          subj.complete();
        }, err => {
          this.helper.showError(
            this.errorHandler.handleError(err)
          );
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  getAllLite(params?): Observable<MenuCategory[]> {
    const obs = this.apiClient.get<MenuCategory[]>(
      `${this.endpoint}/lite`,
      params,
    );
    return obs;
  }
}
