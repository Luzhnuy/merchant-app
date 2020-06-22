import { Injectable } from '@angular/core';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { EntitiesService } from './entities.service';
import { MenuItemOption } from './menu-item-option';

@Injectable({
  providedIn: 'root'
})
export class ItemOptionService extends EntitiesService<MenuItemOption> {

  protected readonly endpoint = 'menu-item-option';

  constructor(
    protected readonly apiClient: ApiV2Service,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
  ) {
    super(helper, errorHandler);
  }
}
