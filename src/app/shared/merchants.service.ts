import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { UserServiceV2 } from './user-v2.service';
import { ApiV2Service } from './api-v2.service';
import { EntitiesService } from './entities.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';
import { MerchantV2 } from './merchant-v2';

@Injectable({
  providedIn: 'root',
})
export class MerchantsService extends EntitiesService<MerchantV2> {

  private readonly $$merchant = new ReplaySubject<MerchantV2>(1);
  public readonly $merchant: Observable<MerchantV2> = this.$$merchant.asObservable();

  protected readonly endpoint = 'merchants';
  private $subscription: Subscription;

  private isWatching = false;

  constructor(
    protected readonly apiClient: ApiV2Service,
    private userService: UserServiceV2,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
  ) {
    super(helper, errorHandler);
    this.init();
  }

  init() {
    this.userService
      .$user
      .subscribe(async (user) => {
        if (user && user.isLogged()) {
          try {
            const merchant = await this.loadProfile().toPromise();
            merchant.categories = [];
            this.$$merchant.next(merchant);
          } catch (e) {
            // TODO show error
            this.userService.logout();
          }
        } else {
          this.$$merchant.next(null);
        }
      });
  }

  async reloadMerchantData() {
    const merchant = await this.loadProfile().toPromise();
    this.$$merchant.next(merchant);
  }

  loadProfile() {
    const subj = new Subject<MerchantV2>();
    this.apiClient.get(
      `${this.endpoint}/me`,
    )
      .subscribe(
        (data: MerchantV2) => {
          data.categories = [];
          subj.next(new MerchantV2(data));
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  contactUs(data) {
    return this.apiClient
      .post(
        `${this.endpoint}/contact-email`,
        data,
      );
  }

  // updateProfileData(profile: Partial<MerchantV2>) {
  //   this.$$merchant
  //     .pipe(take(1))
  //     .subscribe(dr => {
  //       if (dr) {
  //         Object.assign(dr, profile);
  //         this.$$merchant.next(dr);
  //       }
  //     });
  // }

}
