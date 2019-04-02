import { EventEmitter, Injectable } from '@angular/core';
import { Product } from './product';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
  ) {
  }

  saveProduct(accountId: string, product: Product) {
    const ev = new EventEmitter<boolean>();
    const data: any = Object.assign({}, product);
    data.id = accountId;
    data.iditem = product.id;
    this.http
      .post(
        this.apiService.getUrl(`/marchands/addproduct/`),
        data,
      )
      .subscribe((resp: { success: boolean }) => {
        ev.emit(resp.success);
      }, err => ev.emit(false));
    return ev.asObservable();
  }

  deleteProduct(accountId: string, productId: string) {
    const ev = new EventEmitter<boolean>();
    this.http
      .get(
        this.apiService.getUrl(`/marchands/deleteproduct/${accountId}/${productId}`),
      )
      .subscribe((resp: { success: boolean }) => {
        ev.emit(resp.success);
      }, err => ev.emit(false));
    return ev.asObservable();
  }
}
