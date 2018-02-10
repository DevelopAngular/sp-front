import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService{
    barerService = new BehaviorSubject<string>('');
    currentBarer = this.barerService.asObservable();

    constructor(){}

    updateBarer(barer: string){
        this.barerService.next(barer);
    }
}