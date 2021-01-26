import { Injectable } from '@angular/core';
import { EntitiesService } from './entities.service';
import { MenuItem } from './menu-item';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import {environment} from "../../environments/environment";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ItemsV2Service extends EntitiesService<MenuItem> {

  protected readonly endpoint = 'menu-items';

  constructor(
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
    protected readonly apiClient: ApiV2Service,
  ) {
    super(helper, errorHandler);
  }

  getAll(params?) {
    return super.getAll(params)
      .pipe(map(items => items.map(item => {
        if (item.image) {
          item.image = environment.imageHost + item.image;
        }
        return item;
      })));
  }

  getSingle(id) {
    return super.getSingle(id)
      .pipe(map(item => {
        if (item.image) {
          item.image = environment.imageHost + item.image;
        }
        return item;
      }));
  }
}
