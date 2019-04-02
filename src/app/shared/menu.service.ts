import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Menu } from './menu';
import { UserService } from './user.service';
import { Product } from './product';
import { Category } from './category';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private _menus$ = new BehaviorSubject<Menu[]>([]);
  readonly menus$ = this._menus$.asObservable();
  private _menus: Menu[];
  get menus() {
    return this._menus;
  }

  constructor(
    private http: HttpClient,
    private apiSerivce: ApiService,
    private userService: UserService,
    private zone: NgZone,
  ) {
    this.userService
      .user$
      .subscribe(user => {
        if (user) {
          this.loadMenu();
        }
      });
  }

  loadMenu() {
    this.http
      .get(
        this.apiSerivce.getUrl(`/marchands/categories/${this.userService.user.id}`)
      )
      .subscribe(
        (menus: {Menu: Product[]; Category: Category}[]) => this.zone.run(() => {
          this._menus = menus.map(menu => new Menu(menu.Category, menu.Menu));
          this._menus$.next(this._menus);
        }
      ));
  }
}
