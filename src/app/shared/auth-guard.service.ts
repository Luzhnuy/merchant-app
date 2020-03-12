import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserServiceV2 } from './user-v2.service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserServiceV2,
    ) {}

  canActivate() {
    const subj = new ReplaySubject<boolean>(1);
    this.userService
      .$user
      .subscribe(user => {
        if (!user.isLogged()) {
          this.router.navigate(['/', 'login']);
        }
        subj.next(user.isLogged());
        subj.complete();
      });
    return subj.asObservable();
  }
}
