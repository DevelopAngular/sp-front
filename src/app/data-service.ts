import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService{
    barerService = new BehaviorSubject<string>('');
    currentBarer = this.barerService.asObservable();

    gUserService = new BehaviorSubject<any>({});
    currentGUser = this.gUserService.asObservable();

    constructor(){}

    updateBarer(barer: string){
        this.barerService.next(barer);
    }

    updateGUser(gUser: any){
        this.gUserService.next(gUser);
    }
}