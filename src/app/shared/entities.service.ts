import { Subject } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { HelperService } from './helper.service';
import { ErrorHandlerService } from './error-handler.service';

export abstract class EntitiesService<T extends { id: number }> {

  protected abstract readonly endpoint;
  protected abstract readonly apiClient: ApiV2Service;

  constructor(
    // public popupHelper: PopupsHelperService,
    public helper: HelperService,
    public errorHandler: ErrorHandlerService,
  ) {}

  getAll(params?) {
    const subj = new Subject<T[]>();
    this.apiClient.get(
      `${this.endpoint}`,
      params,
    )
      .subscribe(
        (data: T[]) => {
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

  getSingle(id) {
    const subj = new Subject<T>();
    this.apiClient.get(
      `${this.endpoint}/${id}`,
    )
      .subscribe(
        (data: T) => {
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

  create(entity: Partial<T>) {
    const subj = new Subject<T>();
    this.apiClient.post(
      `${this.endpoint}`,
      entity,
    )
      .subscribe(
        (data: T) => {
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

  update(entity: Partial<T>) {
    const subj = new Subject<T>();
    this.apiClient.put(
      `${this.endpoint}/${entity.id}`,
      entity,
    )
      .subscribe(
        (data: T) => {
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

  remove(id) {
    const subj = new Subject<T>();
    this.apiClient.delete(
      `${this.endpoint}/${id}`,
    )
      .subscribe(
        (data: T) => {
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
}
