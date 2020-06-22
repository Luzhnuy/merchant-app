import { Injectable } from '@angular/core';
import { EntitiesService } from './entities.service';
import { MenuSubOption } from './menu-sub-option';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SubOptionsService extends EntitiesService<MenuSubOption> {

  protected readonly endpoint = 'menu-sub-options';

  constructor(
    protected readonly apiClient: ApiV2Service,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
  ) {
    super(helper, errorHandler);
  }
}
