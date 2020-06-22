import { Injectable } from '@angular/core';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { EntitiesService } from './entities.service';
import { MenuOption } from './menu-option';

@Injectable({
  providedIn: 'root'
})
export class OptionsService extends EntitiesService<MenuOption> {

  protected readonly endpoint = 'menu-options';

  constructor(
    protected readonly apiClient: ApiV2Service,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
  ) {
    super(helper, errorHandler);
  }
}
