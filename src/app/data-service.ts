import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {User} from './NewModels';
import { UserService } from './user.service';
@Injectable()
export class DataService {

    barerService = new BehaviorSubject<string>('');
    currentBarer = this.barerService.asObservable();

    // userService = new BehaviorSubject<User>(null);
    currentUser = this.userService.userData.asObservable();

    constructor(private userService: UserService) {
    }

}
