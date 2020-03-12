import { Injectable } from '@angular/core';
import { EntitiesService } from './entities.service';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { PaymentCard } from './payment-card';
import { PaymentCardCredentials } from './payment-card-credentials';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentCardsService extends EntitiesService<PaymentCard> {

  protected readonly endpoint = 'payment-cards';

  constructor(
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
    protected readonly apiClient: ApiV2Service,
  ) {
    super(helper, errorHandler);
  }

  save(data: PaymentCardCredentials) {
    const subj = new Subject<PaymentCard>();
    this.apiClient.post(
      `${this.endpoint}/set-card`,
      data
    )
      .subscribe(
        (resp: PaymentCard) => {
          subj.next(new PaymentCard(resp));
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }
}
