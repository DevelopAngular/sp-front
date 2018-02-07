import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService{

    private barerSource = new BehaviorSubject<string>("default barer");
    currentBarer = this.barerSource.asObservable();

    constructor(){
        
    }

    updateBarer(barer: string){
        this.barerSource.next(barer);
    }

}