import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    ) {}

  canActivate() {
    // Check to see if a user has a valid token
    if (this.userService.isAuthenticated()) {
      // If they do, return true and allow the user to load app
      return true;
    }

    // If not, they redirect them to the login page
    this.router.navigate(['/login']);
    return false;
  }
}
