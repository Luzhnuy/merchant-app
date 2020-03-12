import { Inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
@Injectable()
export class ApiV2Service {

  private readonly BASE_URL = environment.apiUrlV2;
  private authToken: string;

  constructor(
    private http: HttpClient,
  ) {}

  get<T>(endpoint: string, params: any = null) {
    const headers = this.getHeaders();
    return this.http.get<T>(this.getUrl(endpoint), {params, headers});
  }

  post<T>(endpoint: string, data: any) {
    const headers = this.getHeaders();
    return this.http.post<T>(this.getUrl(endpoint), data, {headers});
  }

  put<T>(endpoint: string, data: any) {
    const headers = this.getHeaders();
    return this.http.put<T>(this.getUrl(endpoint), data, {headers});
  }

  delete<T>(endpoint: string) {
    const headers = this.getHeaders();
    return this.http.delete<T>(this.getUrl(endpoint), {headers});
  }

  setAuth(token) {
    this.authToken = token;
  }

  clearAuth() {
    this.authToken = null;
  }

  getUrl(endpoint: string) {
    return this.BASE_URL + endpoint;
  }

  private getHeaders() {
    let headers = new HttpHeaders();
    if (this.authToken) {
      headers = headers.append('Authorization', `Bearer ${this.authToken}`);
      // headers = headers.append('test', `${this.authToken}`);
    }
    return headers;
  }
}
