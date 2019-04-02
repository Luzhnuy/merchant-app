import { EventEmitter, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Category } from './category';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private http: HttpClient,
  ) { }

  saveCategory(accountId: string, category: Category) {
    const ev = new EventEmitter<boolean>();
    const data: any = Object.assign({}, category);
    data.id = accountId;
    data.iditem = category.id;
    this.http
      .post(
        this.apiService.getUrl(`/marchands/addcategory/`),
        data,
      )
      .subscribe((resp: { success: boolean }) => {
        ev.emit(resp.success);
      }, err => ev.emit(false));
    return ev.asObservable();
  }

  deleteCategory(accountId: string, categoryId: string) {
    const ev = new EventEmitter<boolean>();
    this.http
      .get(
        this.apiService.getUrl(`/marchands/deletecategory/${accountId}/${categoryId}`),
      )
      .subscribe((resp: { success: boolean }) => {
        ev.emit(resp.success);
      }, err => ev.emit(false));
    return ev.asObservable();
  }
}
