import {Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { User } from './models/User';
import { DataService } from './services/data-service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';

@Injectable()
export class CurrentUserResolver implements Resolve<User> {
    constructor(
        private dataService: DataService,
        private router: Router
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<User> {
        return this.dataService.currentUser.pipe(take(1));
    }
}
