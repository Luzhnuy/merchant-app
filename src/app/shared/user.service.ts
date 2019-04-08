import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user';

declare var localStorage: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _user$ = new BehaviorSubject<User>(null);
  readonly user$: Observable<User> = this._user$.asObservable();
  private _user: User = null;
  public get user() {
    return this._user;
  }

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) {
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'null') {
      this._user = new User(JSON.parse(userData));
      this._user$.next(this._user);
    }
  }

  login(username, password) {
    const event = new EventEmitter<boolean>();
    this.http
      .get(
        this.apiService.getUrl(`users/apilogin/${username}/${password}`)
      )
      .subscribe(
        (userData: User) => {
          if (userData.success && userData.account != 'NONE') {
            if (userData.logo.includes('NNIMG')) {
              userData.logo = this.apiService.apiUrl + '/img/NoImg.png';
            } else {
              userData.logo = this.apiService.apiUrl + '/files/account/logo/' + userData.id + '/' + userData.logo;
            }
            localStorage.setItem('user', JSON.stringify(userData));
            this._user = new User(userData);
            this._user$.next(this._user);
            event.emit(true);
          } else {
            event.emit(false);
          }
        },
        (error) => {
          console.log(error);
          event.emit(false);
        }
      );
    return event.asObservable();
  }

  restorePassword(username) {
    const event = new EventEmitter<boolean>();
    this.http
      .post(
        this.apiService.getUrl('users/apigetpasswordjson/'),
        { username },
      )
      .subscribe(
        (res: {success: boolean}) => {  // success | invalid
          event.emit(res.success);
        },
        err => {
          event.emit(false);
        });

    return event.asObservable();
  }

  createUser(firstname: string, lastname: string, email: string, password: string) {
    const event = new EventEmitter<boolean>();

    this.http
      .post(
        this.apiService.getUrl('users/apiaddjson'),
        {
          firstname,
          lastname,
          username: email,
          password,
        },
      )
      .subscribe(
        (data: {success: boolean}) => {
          event.emit(data.success);
        },
        err => {
          if (err.statusText === 'OK') {
            event.emit(true);
          } else {
            event.emit(false);
          }
        });
    return event.asObservable();
  }

  updateUserData(data: Partial<User>) {
    Object.assign(this.user, data);
    localStorage.setItem('user', JSON.stringify(this.user));
    this._user$.next(this._user);
  }

  logout() {
    this._user = null;
    this._user$.next(null);
    localStorage.setItem('user', null);
  }

  isAuthenticated() {
    return this.user && this.user.id && this.user.account !== 'NONE';
  }

}
