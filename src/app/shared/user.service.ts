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
    const payload = new FormData();

    // payload.append('username', username);
    payload.append('{"username":"marie@marie.com"}', '');


    // $http({
    //   method: 'POST',
    //   url: urlApi + '/users/apigetpassword/',
    //   data: $scope.olduser,
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // })
    //   .success(function(data) {
    //     console.log(data);
    //     if (data == "success") {
    //       $scope.olduser.username = '';
    //       $scope.forgotpasswordsuccess = true;
    //
    //     } else if (data == "invalid") {
    //       $scope.forgotpasswordinvalid = true;
    //     } else {
    //       $scope.forgotpassworderror = true;
    //     }
    //   });


    this.http
      .post(
        this.apiService.getUrl('users/apigetpassword/'),
        payload
      )
      .subscribe(
        (res) => {  // success | invalid
          debugger;
        },
        err => {
          debugger;
        });
    // success | invalid
    // Username or Email invalid.
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

}
