import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {User} from './models';
@Injectable()
export class DataService {

    barerService = new BehaviorSubject<string>('');
    currentBarer = this.barerService.asObservable();

    gUserService = new BehaviorSubject<any>({});
    currentGUser = this.gUserService.asObservable();

    toService = new BehaviorSubject<string>('');
    currentTo = this.toService.asObservable();

    fromService = new BehaviorSubject<string>('');
    currentFrom = this.fromService.asObservable();

    selectedTabService = new BehaviorSubject<any>('');
    currentTab = this.selectedTabService.asObservable();

    userService = new BehaviorSubject<User>(null);
    currentUser = this.userService.asObservable();

    constructor(){}

    updateBarer(barer: string){
        this.barerService.next(barer);
    }

    updateGUser(gUser: any){
        this.gUserService.next(gUser);
    }

    updateTo(to: string){
        this.toService.next(to);
    }

    updateFrom(from: string){
        this.fromService.next(from);
    }

    updateTab(tab: any){
        this.selectedTabService.next(tab);
    }

    updateUser(user: User){
        this.userService.next(user);
    }
}
