import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotSeenIntroGuard implements CanActivate {

  constructor(private router: Router, private errorHandler: ErrorHandler) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('canActivate intro:', localStorage.getItem('smartpass_intro') !== 'seen');

    if (localStorage.getItem('smartpass_intro') !== 'seen') {
      this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
    }

    return true;
  }
}
