import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  readonly apiUrl = 'http://pizza-delivery.local/';
  // readonly apiUrl = 'http://search.api.snapgrabdelivery.com/';

  constructor() {}

  public getUrl(path) {
    return this.apiUrl + path;
  }
}
