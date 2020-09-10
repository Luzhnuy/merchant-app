import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { ApiToken } from './api-token';

@Injectable({
  providedIn: 'root',
})
export class ApiTokensService {

  protected readonly endpoint = 'tokens';

  constructor(
    protected readonly apiClient: ApiV2Service,
  ) {}

  getToken(production: boolean = true) {
    const subj = new Subject<ApiToken>();
    this.apiClient.get(
      this.getEndpoint(production),
    )
      .subscribe(
        (token: ApiToken) => {
          subj.next(new ApiToken(token));
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  generateToken(password, production: boolean = true) {
    const subj = new Subject<ApiToken>();
    this.apiClient.post(
      this.getEndpoint(production),
      { password }
    )
      .subscribe(
        (token: ApiToken) => {
          subj.next(new ApiToken(token));
          subj.complete();
        }, err => {
          subj.error(err);
          subj.complete();
        },
      );
    return subj.asObservable();
  }

  private getEndpoint(production: boolean) {
    return production ? this.endpoint : `${this.endpoint}/test`;
  }

}
